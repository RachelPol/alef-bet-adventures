CREATE TABLE public.ai_feature_blocks (feature text PRIMARY KEY, status integer NOT NULL, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_feature_blocks TO service_role;
REVOKE ALL ON public.ai_feature_blocks FROM anon, authenticated;
ALTER TABLE public.ai_feature_blocks ENABLE ROW LEVEL SECURITY;