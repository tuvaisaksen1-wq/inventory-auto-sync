import { prisma } from "../server/prisma.server";

export async function loader() {
  const session = await prisma.session.findFirst({
    where: { isOnline: false },
  });

  if (!session) {
    return Response.json({ error: "No session found" }, { status: 404 });
  }

  return Response.json({
    shop: session.shop,
    access_token: session.accessToken,
    location_id: null
  }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
