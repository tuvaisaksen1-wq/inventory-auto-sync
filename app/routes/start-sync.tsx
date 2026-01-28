import type { ActionFunctionArgs } from "@react-router/node";
import { triggerInventorySync } from "../server/n8n.server";
import {
  createSyncRun,
  getSupplierProfile,
  setSyncRunStatus,
  setSyncRunSummary,
} from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

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

  const payload = {
    profile,
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

    void (async () => {
      try {
        await setSyncRunStatus(runId, "running");
        const n8n = await triggerInventorySync(payload);

        if (n8n.ok) {
          const summarySource =
            Array.isArray(n8n.data) && n8n.data.length > 0 ? n8n.data[0] : n8n.data;
          if (summarySource && typeof summarySource === "object") {
            await setSyncRunSummary(runId, summarySource as Record<string, unknown>);
          }
          await setSyncRunStatus(runId, "success");
        } else {
          await setSyncRunSummary(
            runId,
            typeof n8n.data === "object" && n8n.data !== null
              ? (n8n.data as Record<string, unknown>)
              : { error: n8n.data ?? `HTTP ${n8n.status}` }
          );
          await setSyncRunStatus(runId, "failed", JSON.stringify(n8n.data ?? n8n.status));
        }
      } catch (error) {
        await setSyncRunSummary(runId, { error: String(error) });
        await setSyncRunStatus(runId, "failed", String(error));
      }
    })();

    return json(
      { ok: true, run_id: runId, status: "queued" },
      { status: 202 }
    );
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}
