import { prisma } from "../server/prisma.server";

export async function loader() {

  const snapshot = await prisma.stock_snapshots.findFirst();

  if (!snapshot) {
    return new Response(JSON.stringify(null), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(
    JSON.stringify({
      name: snapshot.tenant_id,
      url: snapshot.tenant_id
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}
