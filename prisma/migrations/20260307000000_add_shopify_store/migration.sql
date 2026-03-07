CREATE TABLE IF NOT EXISTS "shopify_stores" (
  "shop" TEXT NOT NULL,
  "access_token" TEXT NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "shopify_stores_pkey" PRIMARY KEY ("shop")
);
