-- Add summary column to sync_runs
ALTER TABLE IF EXISTS public.sync_runs
ADD COLUMN IF NOT EXISTS summary jsonb NULL;
