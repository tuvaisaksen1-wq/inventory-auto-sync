import type { ActionFunctionArgs } from "@react-router/node";
import { triggerInventorySync } from "../server/n8n.server";
import { getAdminAccessTokenFromSession, isUserAccessToken } from "../server/shopify-token.server";
import {
  createSyncRun,
  getSupplierProfile,
  setSyncRunStatus,
  setSyncRunSummary,
  updateSupplierNextRun,
  computeNextRunAt,
} from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

function toRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function withNormalizedShopAuth(profile: Record<string, unknown>) {
  const shop = toRecord(profile.shop);
  if (!shop) return profile;

  const token =
    typeof shop.access_token === "string" ? shop.access_token : "";
  const explicitType =
    typeof shop.access_token_type === "string" ? shop.access_token_type : "";
  const useBearer =
    explicitType === "user_bearer" || isUserAccessToken(token);

  const authHeaderName = useBearer
    ? "Authorization"
    : "X-Shopify-Access-Token";
  const authHeaderValue = useBearer ? `Bearer ${token}` : token;

  return {
    ...profile,
    shop: {
      ...shop,
      access_token_type: useBearer
        ? "user_bearer"
        : "admin_x_shopify_access_token",
      auth_header_name: authHeaderName,
      auth_header_value: authHeaderValue,
      x_shopify_access_token: token,
    },
  };
}

async function withPreferredAdminToken(profile: Record<string, unknown>) {
  const shop = toRecord(profile.shop);
  if (!shop) return profile;

  const domain = typeof shop.domain === "string" ? shop.domain : "";
  const token = typeof shop.access_token === "string" ? shop.access_token : "";
  if (!domain || !token || !isUserAccessToken(token)) return profile;

  const adminToken = await getAdminAccessTokenFromSession(domain);
  if (!adminToken) return profile;

  return {
    ...profile,
    shop: {
      ...shop,
      access_token: adminToken,
      access_token_type: "admin_x_shopify_access_token",
    },
  };
}

async function readSupplierId(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { supplier_id?: unknown } | null;
    if (body && typeof body.supplier_id === "string") return body.supplier_id;
    return null;
  }

  const form = await request.formData();
  const value = form.get("supplier_id");
  return typeof value === "string" ? value : null;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed" }, { status: 405 });
  }

  const supplierId = await readSupplierId(request);
  if (!supplierId) {
    return json({ ok: false, message: "Missing supplier_id" }, { status: 400 });
  }

  let profile;
  try {
    profile = await getSupplierProfile(supplierId);
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }

  if (!profile) {
    return json({ ok: false, message: "Supplier not found" }, { status: 404 });
  }

  const shop = profile.shop ?? {};
  if (!shop || !("access_token" in shop)) {
    return json(
      { ok: false, message: "Missing Shopify access token for supplier" },
      { status: 400 }
    );
  }

  const profileWithAdminToken = await withPreferredAdminToken(
    profile as Record<string, unknown>
  );

  const payload = {
    profile: withNormalizedShopAuth(profileWithAdminToken),
    trigger: "manual",
    run_id: null as string | null,
  };

  try {
    const runId = await createSyncRun({
      supplierId,
      tenantId: profile.customer_id ?? null,
      trigger: "manual",
      status: "queued",
    });

    if (!runId) {
      return json(
        { ok: false, message: "Failed to create sync run" },
        { status: 500 }
      );
    }

    payload.run_id = runId;

    // Fire-and-forget background job
    void (async () => {
      try {
        await setSyncRunStatus(runId, "running");

        const n8n = await triggerInventorySync(payload);

        console.log("start-sync body", {
          frequency: profile.sync_frequency,
          payload,
        });
        console.log("n8n raw", n8n);

        // Robust: n8n.data can be array/object/null
        const summarySource = Array.isArray(n8n.data)
          ? (n8n.data[0] ?? {})
          : (n8n.data ?? {});

        const frequency = profile.sync_frequency ?? profile.frequency ?? "6h";
        const nextRunAt = computeNextRunAt(frequency);

        const statusValue =
          summarySource && typeof summarySource === "object"
            ? (summarySource as Record<string, unknown>).status
            : null;

        const summary =
          summarySource && typeof summarySource === "object"
            ? ({
                ...summarySource,
                run_id: runId,
                status: statusValue ?? (n8n.ok ? "success" : "failed"),
                next_check: nextRunAt.toISOString(),
                next_run_at: nextRunAt.toISOString(),

                // Debug fields (remove later if you want)
                frequency_used: frequency,
                sync_frequency_in_profile: profile.sync_frequency,
                requested_frequency: profile.sync_frequency ?? null,
              } as Record<string, unknown>)
            : {
                run_id: runId,
                status: n8n.ok ? "success" : "failed",
                next_check: nextRunAt.toISOString(),
                next_run_at: nextRunAt.toISOString(),

                // Debug fields (remove later if you want)
                frequency_used: frequency,
                requested_frequency: profile.sync_frequency ?? null,
              };

        // Save summary FIRST (so /sync-status can show counts)
        await setSyncRunSummary(runId, summary);

        // Then set final status (does not touch summary in your sync.server.ts)
        if (n8n.ok) {
          await setSyncRunStatus(runId, "success");
        } else {
          await setSyncRunStatus(runId, "failed", JSON.stringify(summary));
        }

        // Persist supplier next_run_at for scheduler / list views
        await updateSupplierNextRun(supplierId, nextRunAt);
      } catch (error) {
        await setSyncRunSummary(runId, { run_id: runId, error: String(error) });
        await setSyncRunStatus(runId, "failed", String(error));
      }
    })();

    return json({ ok: true, run_id: runId, status: "queued" }, { status: 202 });
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}
