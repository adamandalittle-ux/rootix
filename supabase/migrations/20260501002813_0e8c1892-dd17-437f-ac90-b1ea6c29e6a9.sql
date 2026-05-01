
CREATE TABLE IF NOT EXISTS public.rooty_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL,
  action_type text NOT NULL,
  description text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooty_actions_platform_date
  ON public.rooty_actions (platform_id, created_at DESC);

ALTER TABLE public.rooty_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view rooty_actions"
  ON public.rooty_actions FOR SELECT TO public USING (true);

CREATE POLICY "Public can insert rooty_actions"
  ON public.rooty_actions FOR INSERT TO public WITH CHECK (true);
