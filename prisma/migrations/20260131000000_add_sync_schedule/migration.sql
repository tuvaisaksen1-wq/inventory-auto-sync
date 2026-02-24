-- Alter supplier_profiles to add sync scheduling fields
ALTER TABLE IF EXISTS public.supplier_profiles
ADD COLUMN IF NOT EXISTS sync_frequency TEXT NOT NULL DEFAULT '6h',
ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
