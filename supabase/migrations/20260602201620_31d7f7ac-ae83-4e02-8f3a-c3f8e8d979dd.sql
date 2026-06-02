CREATE TABLE public.early_access_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.early_access_subscribers TO service_role;
GRANT ALL ON public.early_access_subscribers TO service_role;

ALTER TABLE public.early_access_subscribers ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: writes happen only via the edge function (service role).
CREATE INDEX idx_early_access_email ON public.early_access_subscribers (email);