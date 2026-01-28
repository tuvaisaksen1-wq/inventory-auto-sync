- - public.supplier_profiles definition
- - Drop table
- - DROP TABLE public.supplier_profiles;

CREATE TABLE public.supplier_profiles (
supplier_id text NOT NULL,
"name" text NOT NULL,
status text DEFAULT 'active'::text NULL,
connection_type text NOT NULL,
"connection" text NOT NULL,
matching_key text NOT NULL,
shop text NOT NULL,
frequency text DEFAULT '6h'::text NULL,
notifications text DEFAULT '{}'::jsonb NULL,
created_at timestamptz DEFAULT now() NULL,
updated_at timestamptz DEFAULT now() NULL,
customer_id text NULL,
first_sync_completed bool DEFAULT false NULL,
CONSTRAINT supplier_profiles_customer_supplier_key UNIQUE (customer_id, supplier_id),
CONSTRAINT supplier_profiles_pkey1 PRIMARY KEY (supplier_id)
);

- - public.sync_runs definition
- - Drop table
- - DROP TABLE public.sync_runs;

CREATE TABLE public.sync_runs (
run_id uuid DEFAULT gen_random_uuid() NOT NULL,
tenant_id text NOT NULL,
supplier_id text NOT NULL,
"trigger" text NOT NULL,
status text NOT NULL,
started_at timestamptz DEFAULT now() NOT NULL,
finished_at timestamptz NULL,
updated_count int4 DEFAULT 0 NOT NULL,
skipped_count int4 DEFAULT 0 NOT NULL,
not_found_count int4 DEFAULT 0 NOT NULL,
error_count int4 DEFAULT 0 NOT NULL,
error_summary jsonb NULL,
CONSTRAINT sync_runs_pkey PRIMARY KEY (run_id)
);
CREATE INDEX idx_sync_runs_status ON public.sync_runs USING btree (status);
CREATE INDEX idx_sync_runs_supplier_started ON public.sync_runs USING btree (tenant_id, supplier_id, started_at DESC);

- - public.stock_snapshots definition
- - Drop table
- - DROP TABLE public.stock_snapshots;

CREATE TABLE public.stock_snapshots (
id bigserial NOT NULL,
tenant_id text NULL,
supplier_id text NOT NULL,
matching_key text NOT NULL,
qty int4 NOT NULL,
snapshot_at timestamptz DEFAULT now() NOT NULL,
CONSTRAINT stock_snapshots_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_snapshots_lookup ON public.stock_snapshots USING btree (supplier_id, matching_key, snapshot_at DESC);

- - public.latest_stock definition
- - Drop table
- - DROP TABLE public.latest_stock;

CREATE TABLE public.latest_stock (
supplier_id text NOT NULL,
matching_key text NOT NULL,
qty int4 DEFAULT 0 NULL,
updated_at timestamp DEFAULT now() NULL,
CONSTRAINT chk_latest_stock_defined CHECK (((supplier_id <> ''::text) AND (supplier_id <> 'undefined'::text) AND (matching_key <> ''::text) AND (matching_key <> 'undefined'::text))),
CONSTRAINT latest_stock_pkey PRIMARY KEY (supplier_id, matching_key)
);
CREATE UNIQUE INDEX latest_stock_supplier_key ON public.latest_stock USING btree (supplier_id, matching_key);+
