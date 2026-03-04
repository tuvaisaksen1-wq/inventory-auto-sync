import { prisma } from "../server/prisma.server";

export async function loader() {
  const session = await prisma.session.findFirst({
    where: { isOnline: false },
  });

  if (!session) {
    return new Response(JSON.stringify(null), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      name: session.shop,
      url: session.shop,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
