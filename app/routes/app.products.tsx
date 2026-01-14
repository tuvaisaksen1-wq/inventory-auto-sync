import { useLoaderData } from "react-router";
import Products from "../base44/Products";
import { getLatestProducts, getSuppliers } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const supplierId = url.searchParams.get("supplier_id");

  try {
    const suppliers = await getSuppliers();
    if (!supplierId) {
      return json({ ok: true, supplierId: null, products: [], suppliers });
    }

    const products = await getLatestProducts(supplierId);
    return json({ ok: true, supplierId, products, suppliers });
  } catch (error) {
    return json(
      { ok: false, supplierId, products: [], suppliers: [], message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}

export default function Route() {
  const data = useLoaderData() as {
    ok: boolean;
    supplierId: string | null;
    products: Array<{
      matching_key: string;
      qty: number;
      updated_at?: string | null;
      status: string;
    }>;
    suppliers: Array<{ id: string; name: string }>;
  };

  return (
    <Products
      initialProducts={data.products}
      initialSupplierId={data.supplierId}
      suppliers={data.suppliers}
    />
  );
}
