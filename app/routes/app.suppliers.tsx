import { useLoaderData } from "react-router";
import Suppliers from "../base44/Suppliers";
import { getSuppliers } from "../server/sync.server";

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export async function loader() {
  try {
    const suppliers = await getSuppliers();
    return json({ ok: true, suppliers });
  } catch (error) {
    return json(
      { ok: false, suppliers: [], message: "Database error", error: String(error) },
      { status: 500 }
    );
  }
}

export default function Route() {
  const data = useLoaderData() as {
    ok: boolean;
    suppliers: Array<{
      id: string;
      name: string;
      status: string;
      connection_type?: string | null;
      store_name?: string | null;
      last_sync?: string | null;
      products_count?: number;
    }>;
  };
  return <Suppliers initialSuppliers={data.suppliers} />;
}
