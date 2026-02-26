
import type { ActionFunctionArgs } from "@react-router/node";
import { query } from "../server/db.server";
import { computeNextRunAt } from "../server/sync.server";
import shopify, { authenticate } from "../shopify.server";
import { prisma } from "../server/prisma.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

const N8N_SUPPLIER_SETUP_URL = process.env.N8N_SUPPLIER_SETUP_URL;

type RawInput = Record<string, unknown>;

function toSupplierId(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "supplier";
}

async function readInput(request: Request): Promise<RawInput> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as RawInput;
    return body && typeof body === "object" ? body : {};
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }

  // Fallback: try JSON, otherwise return empty input.
  const body = (await request.json().catch(() => ({}))) as RawInput;
  return body && typeof body === "object" ? body : {};
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function getAccessTokenFromSession(shopDomain: string) {
  // 1) Preferred: use Shopify session storage directly (same store auth uses).
  try {
    const offlineSessionId = shopify.api.session.getOfflineId(shopDomain);
    const offlineSession =
      await shopify.sessionStorage.loadSession(offlineSessionId);
    if (offlineSession?.accessToken && !isUserAccessToken(offlineSession.accessToken)) {
      return offlineSession.accessToken;
    }
  } catch (error) {
    console.error("offline session lookup failed", { shopDomain, error: String(error) });
  }

  // Session storage for Shopify auth lives in Prisma/DATABASE_URL.
  const offlineSession = await prisma.session.findFirst({
    where: {
      shop: shopDomain,
      isOnline: false,
      NOT: { accessToken: { startsWith: "shpua_" } },
    },
    orderBy: { expires: "desc" },
  });
  const offlineToken = offlineSession?.accessToken ?? null;
  if (offlineToken) return offlineToken;

  const fallbackSession = await prisma.session.findFirst({
    where: {
      shop: shopDomain,
      NOT: { accessToken: { startsWith: "shpua_" } },
    },
    orderBy: [{ isOnline: "asc" }, { expires: "desc" }],
  });
  return fallbackSession?.accessToken ?? null;
}

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) return null;
  const [scheme, value] = authorizationHeader.split(" ");
  if (!scheme || !value) return null;
  return scheme.toLowerCase() === "bearer" ? value : null;
}

function isUserAccessToken(token: string) {
  return token.startsWith("shpua_");
}

async function exchangeIdTokenForOfflineAccessToken(
  shopDomain: string,
  idToken: string
) {
  const clientId = process.env.SHOPIFY_API_KEY ?? "";
  const clientSecret = process.env.SHOPIFY_API_SECRET ?? "";
  if (!clientId || !clientSecret) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    subject_token: idToken,
    subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    requested_token_type:
      "urn:shopify:params:oauth:token-type:offline-access-token",
  });

  const response = await fetch(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("token exchange failed", {
      shopDomain,
      status: response.status,
      body: errorText,
    });
    return null;
  }

  const tokenData = (await response.json()) as {
    access_token?: string;
    scope?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
  };

  if (!tokenData.access_token) return null;

  const sessionId = `offline_${shopDomain}`;
  const now = Date.now();
  const expires =
    typeof tokenData.expires_in === "number"
      ? new Date(now + tokenData.expires_in * 1000)
      : null;
  const refreshTokenExpires =
    typeof tokenData.refresh_token_expires_in === "number"
      ? new Date(now + tokenData.refresh_token_expires_in * 1000)
      : null;

  await prisma.session.upsert({
    where: { id: sessionId },
    update: {
      shop: shopDomain,
      state: "token-exchange",
      isOnline: false,
      accessToken: tokenData.access_token,
      scope: tokenData.scope ?? null,
      expires,
      refreshToken: tokenData.refresh_token ?? null,
      refreshTokenExpires,
    },
    create: {
      id: sessionId,
      shop: shopDomain,
      state: "token-exchange",
      isOnline: false,
      accessToken: tokenData.access_token,
      scope: tokenData.scope ?? null,
      expires,
      refreshToken: tokenData.refresh_token ?? null,
      refreshTokenExpires,
    },
  });

  return tokenData.access_token;
}

async function getPrimaryLocationId(shopDomain: string, accessToken: string) {
  const url = `https://${shopDomain}/admin/api/2024-01/locations.json`;
  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify locations error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    locations?: Array<{ id: number; active?: boolean }>;
  };

  const locations = data.locations ?? [];
  const active = locations.find((location) => location.active !== false);
  const chosen = active ?? locations[0];
  return chosen ? String(chosen.id) : null;
}

function decodeShopFromHost(hostValue: string | null) {
  if (!hostValue) return null;
  try {
    const decoded = Buffer.from(hostValue, "base64").toString("utf8");
    if (decoded.includes(".myshopify.com")) {
      return decoded.includes("://") ? new URL(decoded).hostname : decoded;
    }
    const url = decoded.includes("://") ? new URL(decoded) : new URL(`https://${decoded}`);
    const match = url.pathname.match(/\/store\/([^/]+)/);
    if (match?.[1]) {
      return `${match[1]}.myshopify.com`;
    }
  } catch {
    // ignore decode errors
  }
  return null;
}

function decodeShopFromIdToken(token: string | null) {
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(normalized, "base64").toString("utf8");
    const payload = JSON.parse(payloadJson) as { dest?: unknown };
    const dest = typeof payload.dest === "string" ? payload.dest : "";
    if (!dest) return null;
    const hostname = new URL(dest).hostname;
    return hostname.endsWith(".myshopify.com") ? hostname : null;
  } catch {
    return null;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const authResult = await authenticate.admin(request);
  const authenticatedShop = authResult.session?.shop ?? null;
  const idToken = getBearerToken(request.headers.get("authorization"));

  if (!N8N_SUPPLIER_SETUP_URL) {
    return json(
      { ok: false, message: "Missing N8N_SUPPLIER_SETUP_URL env variable" },
      { status: 500 }
    );
  }

  const input = await readInput(request);
  console.log("supplier-setup body", input);
  const url = new URL(request.url);
  const headerShop = request.headers.get("X-Shopify-Shop-Domain");
  const hostParam =
    toStringValue(input.shop_host) ||
    toStringValue(input.host) ||
    url.searchParams.get("host");
  const shopDomain =
    toStringValue(input.shop_domain) ||
    authenticatedShop ||
    headerShop ||
    url.searchParams.get("shop") ||
    decodeShopFromHost(hostParam) ||
    decodeShopFromIdToken(idToken) ||
    null;

  const name = toStringValue(input.name);
  const supplierId =
    toStringValue(input.supplier_id) || (name ? toSupplierId(name) : "");
  const matchingKey =
    toStringValue(input.matching_key) ||
    toStringValue(input.matching_key_type) ||
    "sku";
  const connectionType =
    toStringValue(input.connection_type) || "google_sheet";
  const frequency =
    toStringValue(input.frequency) ||
    "sheet";
  const syncFrequency = toStringValue(input.sync_frequency) || "6h";
  const notificationTypes = toStringArray(input.notification_types);
  const nextRunAt = computeNextRunAt(syncFrequency);
  const testOnly = Boolean(input.test_only);
  // Prefer explicit token, then stored session token, then token exchange.
  let accessToken = toStringValue(input.access_token);
  if (isUserAccessToken(accessToken)) {
    accessToken = "";
  }
  if (!accessToken && shopDomain) {
    accessToken = (await getAccessTokenFromSession(shopDomain)) ?? "";
  }
  if (isUserAccessToken(accessToken)) {
    accessToken = "";
  }
  if (!accessToken && shopDomain && idToken) {
    accessToken =
      (await exchangeIdTokenForOfflineAccessToken(shopDomain, idToken)) ?? "";
  }
  if (isUserAccessToken(accessToken)) {
    accessToken = "";
  }

  if (!supplierId || !name) {
    return json(
      { ok: false, message: "Missing supplier name or supplier_id" },
      { status: 400 }
    );
  }

  if (!testOnly && !shopDomain) {
    return json(
      { ok: false, message: "Missing shop domain for supplier setup" },
      { status: 400 }
    );
  }

  const connection: Record<string, unknown> = {
    type: connectionType,
  };

  if (connectionType === "api") {
    connection.api_url = toStringValue(input.api_url);
    connection.api_key = toStringValue(input.api_key);
    connection.api_endpoint = toStringValue(input.api_endpoint);
  }

  if (connectionType === "google_sheet") {
    connection.sheet_url = toStringValue(input.sheet_url);
    connection.sheet_name = toStringValue(input.sheet_name);
    connection.tabs = {
      source: toStringValue(input.sheet_name),
      headerRow: 1,
      match_col: toStringValue(input.sheet_matching_tab),
      qty_col: toStringValue(input.sheet_tab),
    };
  }

  if (connectionType === "csv" || connectionType === "excel") {
    connection.file_url = toStringValue(input.file_url);
  }

  if (connectionType === "url") {
    connection.scrape_url = toStringValue(input.scrape_url);
    connection.scrape_permission = Boolean(input.scrape_permission);
  }

  if (!testOnly && !accessToken) {
    return json(
      {
        ok: false,
        message:
          "Missing Shopify Admin API access token. Could not derive offline token for this shop.",
      },
      { status: 400 }
    );
  }

  let locationId =
    toStringValue(input.location_id) ||
    toStringValue(input.api_location_id) ||
    toStringValue(input.shop_location_id);
  let locationWarning: string | null = null;
  if (!testOnly && shopDomain && accessToken && !locationId) {
    try {
      locationId = (await getPrimaryLocationId(shopDomain, accessToken)) ?? "";
    } catch (error) {
      // Do not block supplier setup on location lookup failures.
      locationWarning = `Failed to fetch Shopify locations (${String(error)})`;
      locationId = "";
    }
  }

  const profile = {
    customer_id: toStringValue(input.customer_id) || "demo_customer_1",
    supplier_id: supplierId,
    name,
    status: toStringValue(input.status) || "active",
    description: toStringValue(input.description) || null,
    connection_type: connectionType,
    matching_key: matchingKey,
    connection,
    shop: shopDomain && !testOnly
      ? {
          domain: shopDomain,
          platform: "shopify",
          access_token: accessToken || null,
          location_id: locationId || null,
        }
      : null,
    frequency,
    notifications: {
      mode: notificationTypes.length ? "custom" : "critical_only",
      types: notificationTypes.length ? notificationTypes : ["critical_only"],
    },
  };

    if (!testOnly) {
    const shopValue = profile.shop ? JSON.stringify(profile.shop) : "";
    const notificationsValue = JSON.stringify(profile.notifications);
    const connectionValue = JSON.stringify(profile.connection);

    await query(
      `INSERT INTO supplier_profiles (
         supplier_id,
         name,
         status,
         connection_type,
         connection,
         matching_key,
         shop,
         frequency,
         notifications,
         customer_id,
        sync_frequency,
        next_run_at,
        updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, now())
       ON CONFLICT (supplier_id)
       DO UPDATE SET
         name = EXCLUDED.name,
         status = EXCLUDED.status,
         connection_type = EXCLUDED.connection_type,
         connection = EXCLUDED.connection,
         matching_key = EXCLUDED.matching_key,
         shop = EXCLUDED.shop,
         frequency = EXCLUDED.frequency,
         notifications = EXCLUDED.notifications,
         customer_id = EXCLUDED.customer_id,
         sync_frequency = EXCLUDED.sync_frequency,
         next_run_at = EXCLUDED.next_run_at,
         updated_at = now()`,
      [
        supplierId,
        name,
        profile.status,
        connectionType,
        connectionValue,
        matchingKey,
        shopValue,
        frequency,
        notificationsValue,
        profile.customer_id,
        syncFrequency,
        nextRunAt.toISOString(),
      ]
    );
  }

  try {
    const res = await fetch(N8N_SUPPLIER_SETUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, test_only: testOnly }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json(
        { ok: false, message: `n8n error (${res.status}): ${text}` },
        { status: 400 }
      );
    }

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    const response = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

    return json({
      ok: true,
      supplier_id: supplierId,
      ...response,
      products_found: response.products_found ?? response.products ?? null,
      matched: response.matched ?? response.matched_count ?? null,
      warning: locationWarning,
      message:
        response.message ??
        (testOnly ? "Supplier test completed." : "Supplier saved successfully."),
    });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message ?? String(err))
        : String(err);
    return json(
      { ok: false, message: `Failed to reach n8n: ${message}` },
      { status: 500 }
    );
  }
}
