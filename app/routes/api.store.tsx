import prisma from "../server/prisma.server";

export async function loader() {
  const store = await prisma.store.findFirst();

  if (!store) {
    return new Response(JSON.stringify(null), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(
    JSON.stringify({
      name: store.shop,
      url: store.shop
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}
