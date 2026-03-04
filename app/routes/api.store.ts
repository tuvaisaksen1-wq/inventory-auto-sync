import { json } from "@remix-run/node";
import { prisma } from "../server/prisma.server";

export async function loader() {
  const session = await prisma.session.findFirst({
    where: { isOnline: false },
  });

  if (!session) {
    return json({ error: "No Shopify session found" }, { status: 404 });
  }

  return json({
    shop: session.shop,
    access_token: session.accessToken,
    location_id: null
  });
}
