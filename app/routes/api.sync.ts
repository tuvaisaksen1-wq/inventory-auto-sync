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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
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
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

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
