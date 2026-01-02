
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const N8N_SUPPLIER_SETUP_URL = process.env.N8N_SUPPLIER_SETUP_URL;

export async function action({ request }: ActionFunctionArgs) {
  if (!N8N_SUPPLIER_SETUP_URL) {
    return json(
      { ok: false, message: "Missing N8N_SUPPLIER_SETUP_URL env variable" },
      { status: 500 }
    );
  }

  const form = await request.formData();

  const profile = {
    customer_id: "demo_customer_1",
    supplier_id: form.get("supplier_id"),
    name: form.get("name"),
    status: "active",

    connection_type: "google_sheet",
    matching_key: form.get("matching_key") ?? "sku",

    connection: {
      type: "google_sheet",
      sheet_url: form.get("sheet_url"),
      sheet_name: form.get("sheet_name"),
      tabs: {
        source: form.get("sheet_name"),
        headerRow: 1,
        match_col: form.get("match_col"),
        qty_col: form.get("qty_col"),
      },
    },

    shop: {
      domain: form.get("shop_domain"),
      platform: "shopify",
      access_token: form.get("access_token"),
      location_id: form.get("location_id"),
    },

    frequency: form.get("frequency") ?? "6h",
    notifications: {
      mode: "critical_only",
      email: "",
      sms: [],
      slack: [],
    },
  };

  try {
    const res = await fetch(N8N_SUPPLIER_SETUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json(
        { ok: false, message: `n8n error (${res.status}): ${text}` },
        { status: 400 }
      );
    }

    return json({ ok: true, message: "Supplier saved and tested successfully." });
  } catch (err: any) {
    return json(
      { ok: false, message: `Failed to reach n8n: ${err.message ?? String(err)}` },
      { status: 500 }
    );
  }
}
