import { prisma } from "../server/prisma.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function loader() {
  try {

    const session = await prisma.session.findFirst({
      where: { isOnline: false },
      orderBy: { expires: "desc" },
    });

    if (!session) {
      return new Response(
        JSON.stringify({ error: "No Shopify store connected yet" }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    let location_id = null;

    try {
      const res = await fetch(
        `https://${session.shop}/admin/api/2024-10/locations.json`,
        {
          headers: {
            "X-Shopify-Access-Token": session.accessToken,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        location_id = data.locations?.[0]?.id ?? null;
      }
    } catch (err) {
      console.error("Location fetch failed", err);
    }

    return new Response(
      JSON.stringify({
        shop: session.shop,
        access_token: session.accessToken,
        location_id,
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}


export async function action({ request }: { request: Request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: CORS_HEADERS,
  });
}
