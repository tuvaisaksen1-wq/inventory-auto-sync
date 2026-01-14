import type { ActionFunctionArgs } from "@react-router/node";
import { disconnectSupplier } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ ok: false, message: "Method not allowed" }, { status: 405 });
  }

  const supplierId = params.supplier_id;
  if (!supplierId) {
    return json({ ok: false, message: "Missing supplier_id" }, { status: 400 });
  }

  try {
    const updated = await disconnectSupplier(supplierId);
    if (!updated) {
      return json({ ok: false, message: "Supplier not found" }, { status: 404 });
    }
    return json({ ok: true, status: "disconnected" });
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}
