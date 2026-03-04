import { prisma } from "../server/prisma.server";

export async function loader() {
  const session = await prisma.session.findFirst({
    where: { isOnline: false }
  });

  return new Response(JSON.stringify(session));
}
