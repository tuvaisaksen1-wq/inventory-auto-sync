import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";
import {
  getAdminAccessTokenFromSession,
  isUserAccessToken,
} from "../server/shopify-token.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
};

function toRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveHeader(token: string) {
  if (isUserAccessToken(token)) {
    return {
      name: "Authorization",
      value: `Bearer ${token}`,
    };
  }

  return {
    name: "X-Shopify-Access-Token",
    value: token,
  };
}

async function readInput(request: Request) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    return {
      shopDomain: url.searchParams.get("shop") ?? "",
      accessToken: url.searchParams.get("token") ?? "",
      endpoint: url.searchParams.get("endpoint") ?? "/admin/api/2024-10/shop.json",
    };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = toRecord(await request.json().catch(() => ({})));
    return {
      shopDomain:
        toStringValue(body.shop_domain) ||
        toStringValue(body.shop) ||
        url.searchParams.get("shop") ||
        "",
      accessToken:
        toStringValue(body.access_token) ||
        toStringValue(body.token) ||
        url.searchParams.get("token") ||
        "",
      endpoint:
        toStringValue(body.endpoint) ||
        url.searchParams.get("endpoint") ||
        "/admin/api/2024-10/shop.json",
    };
  }

  return {
    shopDomain: url.searchParams.get("shop") ?? "",
    accessToken: url.searchParams.get("token") ?? "",
    endpoint: url.searchParams.get("endpoint") ?? "/admin/api/2024-10/shop.json",
  };
}

async function handleRequest(request: Request) {
  const input = await readInput(request);
  const shopDomain = toStringValue(input.shopDomain);
  const explicitToken = toStringValue(input.accessToken);
  const endpoint = toStringValue(input.endpoint) || "/admin/api/2024-10/shop.json";
  const forcedAdminToken = (
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN_OVERRIDE ?? ""
  ).trim();

  if (!shopDomain) {
    return json(
      { ok: false, message: "Missing shop. Use ?shop=your-store.myshopify.com" },
      { status: 400 }
    );
  }

  let accessToken = "";
  let tokenSource = "none";

  if (forcedAdminToken && !isUserAccessToken(forcedAdminToken)) {
    accessToken = forcedAdminToken;
    tokenSource = "env_override";
  } else if (explicitToken) {
    accessToken = explicitToken;
    tokenSource = "request";
  } else {
    accessToken = (await getAdminAccessTokenFromSession(shopDomain)) ?? "";
    tokenSource = accessToken ? "stored_session" : "none";
  }

  if (!accessToken) {
    return json(
      {
        ok: false,
        message: "No token available for this shop",
        debug: {
          shopDomain,
          tokenSource,
          hasEnvOverride: Boolean(forcedAdminToken),
        },
      },
      { status: 400 }
    );
  }

  const header = resolveHeader(accessToken);
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `https://${shopDomain}${normalizedEndpoint}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      [header.name]: header.value,
    },
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  return json(
    {
      ok: response.ok,
      status: response.status,
      shop_domain: shopDomain,
      url,
      token_source: tokenSource,
      token_prefix: accessToken.slice(0, 6),
      header_name: header.name,
      response: parsed ?? text,
    },
    { status: response.ok ? 200 : 400 }
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  return handleRequest(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return handleRequest(request);
}
