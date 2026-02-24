-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Ensure uuid generator is available for sync_runs.run_id
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Baseline tables used by sync backend
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    supplier_id TEXT PRIMARY KEY,
    customer_id TEXT,
    name TEXT,
    status TEXT,
    connection_type TEXT,
    connection JSONB,
    matching_key TEXT,
    shop JSONB,
    frequency TEXT,
    notifications JSONB,
    sync_frequency TEXT NOT NULL DEFAULT '6h',
    next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    supplier_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    updated_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    not_found_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    error_summary JSONB,
    summary JSONB,
    CONSTRAINT sync_runs_supplier_fk
      FOREIGN KEY (supplier_id) REFERENCES public.supplier_profiles(supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_status
  ON public.sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sync_runs_supplier_started
  ON public.sync_runs(tenant_id, supplier_id, started_at);
