import { json } from "@remix-run/node";
import { prisma } from "../server/prisma.server";

export async function loader() {
  try {
    const session = await prisma.session.findFirst({
      where: { isOnline: false },
    });

    if (!session) {
      return json(
        { error: "No Shopify store connected yet" },
        { status: 404 }
      );
    }

    return json({
      shop: session.shop,
      access_token: session.accessToken,
      location_id: null
    });

  } catch (error) {
    console.error("API /api/store error:", error);
    return json({ error: "Server error" }, { status: 500 });
  }
}
