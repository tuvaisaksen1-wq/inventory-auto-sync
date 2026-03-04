import { prisma } from "../server/prisma.server";

export async function action({ request }: { request: Request }) {
  // Handle OPTIONS preflight
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function loader() {
  try {
    const session = await prisma.session.findFirst({
      where: { isOnline: false },
    });

    if (!session) {
      return Response.json(
        { error: "No Shopify store connected yet" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return Response.json({
      shop: session.shop,
      access_token: session.accessToken,
      location_id: null
    }, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });

  } catch (error) {
    console.error("API /api/store error:", error);
    return Response.json({ error: "Server error" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
