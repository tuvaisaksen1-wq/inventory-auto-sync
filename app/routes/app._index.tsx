import type { LoaderFunctionArgs } from "@react-router/node";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import Dashboard from "../base44/Dashboard";
import {
  getRecentActivity,
  getRecentProducts,
  getSuppliers,
} from "../server/sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const [suppliers, products, activity] = await Promise.all([
      getSuppliers(),
      getRecentProducts(),
      getRecentActivity(),
    ]);

    return {
      shop: session.shop,
      suppliers,
      products,
      activity,
    };
  } catch (error) {
    console.error("Dashboard loader error:", error);

    return {
      shop: session.shop,
      suppliers: [],
      products: [],
      activity: [],
      error: "Database error",
    };
  }
}

export default function AppIndex() {
  const data = useLoaderData() as {
    shop: string;
    suppliers: any[];
    products: any[];
    activity: any[];
    error?: string;
  };

  return (
    <Dashboard
      suppliers={data.suppliers}
      products={data.products}
      activity={data.activity}
      error={data.error}
    />
  );
}
