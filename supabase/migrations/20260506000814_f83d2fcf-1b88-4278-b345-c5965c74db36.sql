ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS admin_warning text,
  ADD COLUMN IF NOT EXISTS admin_warning_at timestamptz;

ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

CREATE INDEX IF NOT EXISTS idx_content_published ON public.content(platform_id, published);