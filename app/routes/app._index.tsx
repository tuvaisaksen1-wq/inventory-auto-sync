import { useLoaderData } from "react-router";
import Dashboard from "../base44/Dashboard";
import { getRecentActivity, getRecentProducts, getSuppliers } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function loader() {
  try {
    const [suppliers, products, activity] = await Promise.all([
      getSuppliers(),
      getRecentProducts(),
      getRecentActivity(),
    ]);
    return json({ ok: true, suppliers, products, activity });
  } catch (error) {
    return json(
      {
        ok: false,
        suppliers: [],
        products: [],
        activity: [],
        message: "Database error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export default function Index() {
  const data = useLoaderData() as {
    ok: boolean;
    suppliers: Array<any>;
    products: Array<any>;
    activity: Array<any>;
  };
  return <Dashboard suppliers={data.suppliers} products={data.products} activity={data.activity} />;
}
