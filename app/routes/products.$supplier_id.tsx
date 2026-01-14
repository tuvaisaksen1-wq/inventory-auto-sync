import type { LoaderFunctionArgs } from "@react-router/node";
import { getLatestProducts } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function loader({ params }: LoaderFunctionArgs) {
  const supplierId = params.supplier_id;

  if (!supplierId) {
    return json({ ok: false, message: "Missing supplier_id" }, { status: 400 });
  }

  let products;
  try {
    products = await getLatestProducts(supplierId);
  } catch (error) {
    return json(
      { ok: false, message: "Database error", error: String(error) },
      { status: 500 }
    );
  }

  return json({ ok: true, products });
}
