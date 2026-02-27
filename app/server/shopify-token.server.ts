import type { Session } from "@shopify/shopify-api";
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

export async function persistOfflineAdminSession(session: Session) {
  if (!session.shop || !session.accessToken) return;
  if (isUserAccessToken(session.accessToken)) return;

  const sessionId = `offline_${session.shop}`;

  await prisma.session.upsert({
    where: { id: sessionId },
    update: {
      shop: session.shop,
      state: session.state,
      isOnline: false,
      scope: session.scope ?? null,
      expires: null,
      accessToken: session.accessToken,
      userId: session.onlineAccessInfo?.associated_user?.id
        ? BigInt(session.onlineAccessInfo.associated_user.id)
        : null,
      firstName: session.onlineAccessInfo?.associated_user?.first_name ?? null,
      lastName: session.onlineAccessInfo?.associated_user?.last_name ?? null,
      email: session.onlineAccessInfo?.associated_user?.email ?? null,
      accountOwner:
        session.onlineAccessInfo?.associated_user?.account_owner ?? false,
      locale: session.onlineAccessInfo?.associated_user?.locale ?? null,
      collaborator:
        session.onlineAccessInfo?.associated_user?.collaborator ?? false,
      emailVerified:
        session.onlineAccessInfo?.associated_user?.email_verified ?? false,
    },
    create: {
      id: sessionId,
      shop: session.shop,
      state: session.state,
      isOnline: false,
      scope: session.scope ?? null,
      expires: null,
      accessToken: session.accessToken,
      userId: session.onlineAccessInfo?.associated_user?.id
        ? BigInt(session.onlineAccessInfo.associated_user.id)
        : null,
      firstName: session.onlineAccessInfo?.associated_user?.first_name ?? null,
      lastName: session.onlineAccessInfo?.associated_user?.last_name ?? null,
      email: session.onlineAccessInfo?.associated_user?.email ?? null,
      accountOwner:
        session.onlineAccessInfo?.associated_user?.account_owner ?? false,
      locale: session.onlineAccessInfo?.associated_user?.locale ?? null,
      collaborator:
        session.onlineAccessInfo?.associated_user?.collaborator ?? false,
      emailVerified:
        session.onlineAccessInfo?.associated_user?.email_verified ?? false,
      refreshToken: null,
      refreshTokenExpires: null,
    },
  });
}
