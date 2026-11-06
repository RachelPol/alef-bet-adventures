CREATE TABLE public.child_parent_credentials (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 code_hash text NOT NULL,
 code_salt text NOT NULL,
 failed_attempts integer NOT NULL DEFAULT 0,
 locked_until timestamptz
);
GRANT ALL ON public.child_parent_credentials TO service_role;
REVOKE ALL ON public.child_parent_credentials FROM anon, authenticated;
ALTER TABLE public.child_parent_credentials ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.child_parent_credentials IS 'Server-only salted parent code verifiers, created during child signup; never readable or editable by child sessions.';