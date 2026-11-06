CREATE TABLE public.child_logins (
  name_key text PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.child_logins TO service_role;
REVOKE ALL ON public.child_logins FROM anon, authenticated;
ALTER TABLE public.child_logins ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.child_logins IS 'Server-only child login mapping. PIN credentials are hashed by Auth; optional contact email is not a verified login identity.';