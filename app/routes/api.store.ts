import { json } from "@remix-run/node";

export async function loader() {
  return json({
    name: "connected",
    url: "connected"
  });
}
