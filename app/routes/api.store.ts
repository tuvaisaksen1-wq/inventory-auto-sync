@@ -37,25 +37,37 @@ export async function loader() {
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
