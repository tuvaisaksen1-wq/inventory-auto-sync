export async function loader() {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "store route works"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
