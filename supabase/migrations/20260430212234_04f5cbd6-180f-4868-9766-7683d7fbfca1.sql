-- 1. Add columns to platforms for soft delete + gate mode + admin password
ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_reason text,
  ADD COLUMN IF NOT EXISTS gate_mode text NOT NULL DEFAULT 'open', -- 'open' (no code needed) or 'code' (require student code)
  ADD COLUMN IF NOT EXISTS dashboard_password text; -- teacher-set password for /platform-admin/:slug

-- Backfill: any existing platform_admin_password becomes dashboard_password
UPDATE public.platforms SET dashboard_password = platform_admin_password WHERE dashboard_password IS NULL AND platform_admin_password IS NOT NULL;

-- 2. Allow public to view all non-deleted platforms (so direct preview works without login)
DROP POLICY IF EXISTS "Public can view approved platforms" ON public.platforms;
CREATE POLICY "Public can view non-deleted platforms"
  ON public.platforms
  FOR SELECT
  TO public
  USING (status <> 'deleted' OR deleted_at IS NOT NULL);
-- Note: keep deleted ones queryable too so admin trash view works (RLS is permissive for MVP)
DROP POLICY IF EXISTS "Public can view non-deleted platforms" ON public.platforms;
CREATE POLICY "Public can view all platforms"
  ON public.platforms
  FOR SELECT
  TO public
  USING (true);

-- 3. Allow public DELETE for admin permanent purge (MVP — admin gate is client-side)
DROP POLICY IF EXISTS "Public can delete platforms" ON public.platforms;
CREATE POLICY "Public can delete platforms"
  ON public.platforms
  FOR DELETE
  TO public
  USING (true);

-- 4. AI feedback / suggestions table — every teacher feature request or complaint
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES public.platforms(id) ON DELETE CASCADE,
  platform_name text,
  teacher_message text NOT NULL,
  category text NOT NULL DEFAULT 'request', -- 'request' | 'complaint' | 'suggestion' | 'bug'
  ai_classification text, -- short label from AI: 'animation' | 'color' | 'feature' | 'bug' | etc
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert ai_feedback" ON public.ai_feedback;
CREATE POLICY "Public can insert ai_feedback"
  ON public.ai_feedback FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view ai_feedback" ON public.ai_feedback;
CREATE POLICY "Public can view ai_feedback"
  ON public.ai_feedback FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can update ai_feedback" ON public.ai_feedback;
CREATE POLICY "Public can update ai_feedback"
  ON public.ai_feedback FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Public can delete ai_feedback" ON public.ai_feedback;
CREATE POLICY "Public can delete ai_feedback"
  ON public.ai_feedback FOR DELETE TO public USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON public.ai_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_category ON public.ai_feedback(category);

-- 5. Index to speed up admin views
CREATE INDEX IF NOT EXISTS idx_platforms_status ON public.platforms(status);
CREATE INDEX IF NOT EXISTS idx_platforms_deleted_at ON public.platforms(deleted_at);

-- 6. enable realtime for new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_feedback;
