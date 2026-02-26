import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./server/prisma.server";

const envScopes = (process.env.SCOPES ?? "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const requiredScopes = [
  "read_locations",
  "read_products",
  "read_inventory",
  "write_inventory",
];

const scopes = Array.from(new Set([...envScopes, ...requiredScopes]));

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY ?? "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET ?? "",
  scopes,
  appUrl: process.env.SHOPIFY_APP_URL ?? process.env.APP_URL ?? "",
  apiVersion: ApiVersion.January26,
  distribution: AppDistribution.AppStore,
  sessionStorage: new PrismaSessionStorage(prisma),
});

export default shopify;
export const authenticate = shopify.authenticate;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
