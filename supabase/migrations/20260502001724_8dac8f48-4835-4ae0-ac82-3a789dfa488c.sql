-- Live stream feature: store live URL + title + cover + active flag per platform
ALTER TABLE public.platforms 
  ADD COLUMN IF NOT EXISTS live_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_url text,
  ADD COLUMN IF NOT EXISTS live_title text,
  ADD COLUMN IF NOT EXISTS live_cover_url text,
  ADD COLUMN IF NOT EXISTS live_started_at timestamptz;

-- Make sure realtime publication includes platforms (for student banner updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'platforms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platforms;
  END IF;
END $$;