
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS schedule_days jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lesson_time text;

CREATE TABLE IF NOT EXISTS public.video_watch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL,
  student_id uuid NOT NULL,
  content_id uuid NOT NULL,
  percent integer NOT NULL DEFAULT 0,
  seconds integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, content_id)
);

ALTER TABLE public.video_watch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view video_watch" ON public.video_watch FOR SELECT USING (true);
CREATE POLICY "Public can insert video_watch" ON public.video_watch FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update video_watch" ON public.video_watch FOR UPDATE USING (true);
CREATE POLICY "Public can delete video_watch" ON public.video_watch FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_video_watch_platform ON public.video_watch(platform_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_student ON public.video_watch(student_id);
