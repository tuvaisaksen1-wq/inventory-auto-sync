import type { LoaderFunctionArgs } from "@react-router/node";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import Dashboard from "../base44/Dashboard";
import { getPrimaryLocationId } from "../server/shopify-store.server";
import {
  getRecentActivity,
  getRecentProducts,
  getSuppliers,
} from "../server/sync.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const [suppliers, products, activity, locationId] = await Promise.all([
      getSuppliers(),
      getRecentProducts(),
      getRecentActivity(),
      getPrimaryLocationId(session.shop, session.accessToken),
    ]);

    return {
      shop: session.shop,
      locationId,
      suppliers,
      products,
      activity,
    };
  } catch (error) {
    console.error("Dashboard loader error:", error);

    return {
      shop: session.shop,
      locationId: null,
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
    locationId: string | null;
    suppliers: any[];
    products: any[];
    activity: any[];
    error?: string;
  };

  return (
    <Dashboard
      shop={data.shop}
      locationId={data.locationId}
      suppliers={data.suppliers}
      products={data.products}
      activity={data.activity}
      error={data.error}
    />
  );
}
