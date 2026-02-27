import { prisma } from "./prisma.server";

export function isUserAccessToken(token: string) {
  return token.startsWith("shpua_");
}

export async function getAdminAccessTokenFromSession(shopDomain: string) {
  const offlineById = await prisma.session.findUnique({
    where: { id: `offline_${shopDomain}` },
  });
  if (offlineById?.accessToken && !isUserAccessToken(offlineById.accessToken)) {
    return offlineById.accessToken;
  }

  const offlineSession = await prisma.session.findFirst({
    where: {
      shop: shopDomain,
      isOnline: false,
      NOT: { accessToken: { startsWith: "shpua_" } },
    },
    orderBy: { expires: "desc" },
  });
  if (offlineSession?.accessToken) return offlineSession.accessToken;

  const fallbackSession = await prisma.session.findFirst({
    where: {
      shop: shopDomain,
      NOT: { accessToken: { startsWith: "shpua_" } },
    },
    orderBy: [{ isOnline: "asc" }, { expires: "desc" }],
  });

  return fallbackSession?.accessToken ?? null;
}
