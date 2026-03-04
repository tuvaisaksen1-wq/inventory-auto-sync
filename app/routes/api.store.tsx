import { prisma } from "../server/prisma.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function action() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function loader() {
  try {
    const session = await prisma.session.findFirst({
      where: { isOnline: false },
    });

    if (!session) {
      return Response.json(
        { error: "No Shopify store connected yet" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Fetch location_id from Shopify Admin API server-side (token never leaves server)
    let location_id: string | null = null;
    try {
      const res = await fetch(
        `https://${session.shop}/admin/api/2024-10/locations.json`,
        { headers: { "X-Shopify-Access-Token": session.accessToken } }
      );
      if (res.ok) {
        const data = await res.json();
        location_id = data.locations?.[0]?.id?.toString() ?? null;
      }
    } catch (e) {
      console.error("Failed to fetch location_id:", e);
    }

    return Response.json(
      { shop: session.shop, location_id },
      { headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error("API /api/store error:", error);
    return Response.json({ error: "Server error" }, { status: 500, headers: CORS_HEADERS });
  }
}
