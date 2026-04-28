
ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS requested_students integer,
  ADD COLUMN IF NOT EXISTS requested_tier text,
  ADD COLUMN IF NOT EXISTS upgrade_request text;

ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS file_url text;

-- Ensure realtime on platforms
ALTER TABLE public.platforms REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'platforms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platforms;
  END IF;
END $$;
