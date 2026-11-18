CREATE TABLE public.mountain_progress (
 user_id uuid NOT NULL,
 activity text NOT NULL CHECK (activity IN ('listen','read')),
 streak integer NOT NULL DEFAULT 0 CHECK (streak BETWEEN 0 AND 90),
 completions integer NOT NULL DEFAULT 0 CHECK (completions >= 0),
 version integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,activity)
);
GRANT SELECT, INSERT, UPDATE ON public.mountain_progress TO authenticated;
GRANT ALL ON public.mountain_progress TO service_role;
ALTER TABLE public.mountain_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY mountain_owner_read ON public.mountain_progress FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY mountain_owner_insert ON public.mountain_progress FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY mountain_owner_update ON public.mountain_progress FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE TABLE public.mountain_events (
 user_id uuid NOT NULL,
 activity text NOT NULL CHECK(activity IN ('listen','read')),
 event_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('success','mistake','restart')),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,activity,event_id,kind)
);
GRANT SELECT, INSERT ON public.mountain_events TO authenticated;
GRANT ALL ON public.mountain_events TO service_role;
ALTER TABLE public.mountain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY mountain_events_read ON public.mountain_events FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY mountain_events_insert ON public.mountain_events FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.record_mountain_event(p_activity text,p_event_id uuid,p_kind text)
RETURNS SETOF public.mountain_progress
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE current_row public.mountain_progress; accepted integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_activity NOT IN ('listen','read') OR p_kind NOT IN ('success','mistake','restart') THEN RAISE EXCEPTION 'Invalid event'; END IF;
 INSERT INTO public.mountain_progress(user_id,activity) VALUES(auth.uid(),p_activity) ON CONFLICT DO NOTHING;
 SELECT * INTO current_row FROM public.mountain_progress WHERE user_id=auth.uid() AND activity=p_activity FOR UPDATE;
 INSERT INTO public.mountain_events(user_id,activity,event_id,kind) VALUES(auth.uid(),p_activity,p_event_id,p_kind) ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS accepted = ROW_COUNT;
 IF accepted=1 THEN
 UPDATE public.mountain_progress SET
 streak=CASE WHEN p_kind='restart' THEN 0 WHEN streak=90 THEN 90 WHEN p_kind='mistake' THEN 0 ELSE LEAST(90,streak+1) END,
 completions=completions+CASE WHEN p_kind='success' AND streak=89 THEN 1 ELSE 0 END,
 version=version+1,updated_at=now()
 WHERE user_id=auth.uid() AND activity=p_activity;
 END IF;
 RETURN QUERY SELECT * FROM public.mountain_progress WHERE user_id=auth.uid() AND activity=p_activity;
END; $$;
REVOKE ALL ON FUNCTION public.record_mountain_event(text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_mountain_event(text,uuid,text) TO authenticated,service_role;