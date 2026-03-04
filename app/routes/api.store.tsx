import { json } from "@remix-run/node";
import prisma from "../server/db.server";

export async function loader() {
  const store = await prisma.store.findFirst();

  if (!store) {
    return json(null);
  }

  return json({
    name: store.shop,
    url: store.shop
  });
}
