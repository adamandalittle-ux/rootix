
CREATE TABLE public.platform_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  month_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_payments_platform ON public.platform_payments(platform_id, paid_at DESC);

ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view payments" ON public.platform_payments FOR SELECT USING (true);
CREATE POLICY "Public can insert payments" ON public.platform_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete payments" ON public.platform_payments FOR DELETE USING (true);
