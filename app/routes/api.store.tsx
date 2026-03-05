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

    // Fetch locations from Shopify Admin API server-side
    let locations: Array<{id: string; name: string}> = [];
    try {
      const res = await fetch(
        `https://${session.shop}/admin/api/2024-10/locations.json`,
        { headers: { "X-Shopify-Access-Token": session.accessToken } }
      );
      if (res.ok) {
        const data = await res.json();
        locations = data.locations?.map((loc: any) => ({
          id: loc.id.toString(),
          name: loc.name,
        })) ?? [];
      }
    } catch (e) {
      console.error("Failed to fetch locations:", e);
    }

    return Response.json(
      { shop: session.shop, access_token: session.accessToken, locations },  // ← ENDRET LINJE
      { headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error("API /api/store error:", error);
    return Response.json({ error: "Server error" }, { status: 500, headers: CORS_HEADERS });
  }
}
