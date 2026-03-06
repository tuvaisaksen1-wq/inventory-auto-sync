import type { ActionFunctionArgs } from "@react-router/node";
import {
  getSupplierProfile,
  createSyncRun,
  setSyncRunStatus,
  setSyncRunSummary,
} from "../server/sync.server";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? "";
const BASE44_APP_ID = process.env.BASE44_APP_ID ?? "";
const BASE44_SERVICE_KEY = process.env.BASE44_SERVICE_KEY ?? "";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Call Base44 REST API as service role
async function base44Post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": BASE44_SERVICE_KEY,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function base44Put(path: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.base44.com/api/apps/${BASE44_APP_ID}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": BASE44_SERVICE_KEY,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function action({ request }: ActionFunctionArgs) {
  // Validate internal secret
  const authHeader = request.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  const body = await request.json() as { supplier_id: string; supplier?: Record<string, unknown> };
  const { supplier_id } = body;

  if (!supplier_id) {
    return json({ success: false, error: "supplier_id is required" }, 400);
  }

  // Load supplier profile from Railway DB
  const supplier = await getSupplierProfile(supplier_id);
  if (!supplier) {
    return json({ success: false, error: "Supplier not found" }, 404);
  }

  const shop = supplier.shop as Record<string, string> | null;
  const connection = supplier.connection as Record<string, string> | null;

  if (!shop?.domain || !shop?.access_token) {
    return json({ success: false, error: "Missing Shopify credentials on supplier" }, 400);
  }

  // Create sync run in Railway DB
  const runId = await createSyncRun({
    supplierId: supplier_id,
    tenantId: shop.domain,
    trigger: "base44",
    status: "running",
  });

  try {
    // Fetch Google Sheet data
    const sheetId = connection?.sheet_id;
    const sheetName = connection?.sheet_name ?? "Sheet1";
    const matchCol = supplier.matching_key ?? "SKU";
    const qtyCol = connection?.qty_column ?? "Quantity";

    if (!sheetId) {
      throw new Error("Missing sheet_id in supplier connection config");
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const sheetRes = await fetch(sheetUrl);
    if (!sheetRes.ok) throw new Error(`Failed to fetch sheet: ${sheetRes.status}`);

    const csv = await sheetRes.text();
    const rows = csv.trim().split("\n").map((r) => r.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
    const headers = rows[0];

    const matchIdx = headers.findIndex((h) => h.toLowerCase() === matchCol.toLowerCase());
    const qtyIdx = headers.findIndex((h) => h.toLowerCase() === qtyCol.toLowerCase());

    if (matchIdx === -1 || qtyIdx === -1) {
      throw new Error(`Could not find columns: ${matchCol} / ${qtyCol}`);
    }

    const sheetData = rows.slice(1)
      .filter((r) => r[matchIdx])
      .map((r) => ({ sku: r[matchIdx], qty: parseInt(r[qtyIdx] ?? "0", 10) || 0 }));

    // Run Shopify inventory sync
    let updated = 0, notFound = 0, errors = 0;
    const locationId = shop.location_id ?? connection?.location_id ?? "";

    for (const item of sheetData) {
      try {
        // Find inventory item by SKU
        const searchRes = await fetch(
          `https://${shop.domain}/admin/api/2024-10/variants.json?sku=${encodeURIComponent(item.sku)}&fields=id,inventory_item_id`,
          { headers: { "X-Shopify-Access-Token": shop.access_token } }
        );
        const searchData = await searchRes.json() as { variants?: { inventory_item_id: string }[] };
        const variant = searchData.variants?.[0];

        if (!variant?.inventory_item_id) {
          notFound++;
          continue;
        }

        // Update inventory
        const updateRes = await fetch(
          `https://${shop.domain}/admin/api/2024-10/inventory_levels/set.json`,
          {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": shop.access_token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              location_id: locationId,
              inventory_item_id: variant.inventory_item_id,
              available: item.qty,
            }),
          }
        );

        if (updateRes.ok) {
          updated++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    // Mark run as complete in Railway DB
    const finalStatus = errors > 0 ? "partial_failed" : "success";
    await setSyncRunStatus(runId, finalStatus);
    await setSyncRunSummary(runId, { updated_count: updated, not_found_count: notFound, error_count: errors });

    // Update Base44 Supplier entity
    if (BASE44_APP_ID && BASE44_SERVICE_KEY) {
      await base44Put(`/entities/Supplier/${supplier_id}`, {
        status: errors > 0 ? "attention_required" : "active",
        last_sync: new Date().toISOString(),
        products_count: sheetData.length,
      });

      // Log to Base44 ActivityLog
      await base44Post("/entities/ActivityLog", {
        type: errors > 0 ? "sync_error" : "sync_success",
        title: `Sync completed: ${supplier.name}`,
        description: `Updated: ${updated} | Not found: ${notFound} | Errors: ${errors}`,
        supplier_id,
        supplier_name: supplier.name,
        severity: errors > 0 ? "warning" : "success",
      });
    }

    return json({ success: true, updated_count: updated, not_found_count: notFound, error_count: errors });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await setSyncRunStatus(runId, "failed", msg);

    if (BASE44_APP_ID && BASE44_SERVICE_KEY) {
      await base44Post("/entities/ActivityLog", {
        type: "sync_error",
        title: `Sync failed: ${supplier.name}`,
        description: msg,
        supplier_id,
        supplier_name: supplier.name,
        severity: "error",
      });
    }

    return json({ success: false, error: msg }, 500);
  }
}
