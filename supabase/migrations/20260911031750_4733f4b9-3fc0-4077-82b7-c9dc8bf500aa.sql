CREATE TABLE public.admin_allowlist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_allowlist_email_normalized CHECK (email = lower(btrim(email)))
);

GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_allowlist FROM PUBLIC;
REVOKE ALL ON public.admin_allowlist FROM anon;
REVOKE ALL ON public.admin_allowlist FROM authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT CASE
    WHEN _role = 'admin'::public.app_role THEN
      _user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM auth.users AS u
        JOIN public.admin_allowlist AS a
          ON a.email = lower(btrim(u.email))
        WHERE u.id = _user_id
          AND u.email IS NOT NULL
          AND u.email_confirmed_at IS NOT NULL
      )
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;