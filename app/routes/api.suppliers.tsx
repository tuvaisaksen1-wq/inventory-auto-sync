export function requireInternalToken(request: Request): void {
  const header = request.headers.get("Authorization");
  const token = header?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

