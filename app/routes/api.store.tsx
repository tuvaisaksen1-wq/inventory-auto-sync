import { json } from "@react-router/node";

export async function loader() {
  return json({
    status: "ok",
    message: "store route works"
  });
}
