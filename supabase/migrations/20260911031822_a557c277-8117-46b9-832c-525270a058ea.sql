CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.is_approved_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, private
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM auth.users AS u
      JOIN public.admin_allowlist AS a
        ON a.email = lower(btrim(u.email))
      WHERE u.id = _user_id
        AND u.email IS NOT NULL
        AND u.email_confirmed_at IS NOT NULL
    )
$$;

REVOKE ALL ON FUNCTION private.is_approved_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_approved_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.is_approved_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_approved_admin(uuid) TO service_role;
GRANT USAGE ON SCHEMA private TO authenticated;

DROP POLICY "Admins can view all products" ON public.products;
DROP POLICY "Admins can insert products" ON public.products;
DROP POLICY "Admins can update products" ON public.products;
DROP POLICY "Admins can delete products" ON public.products;

CREATE POLICY "Approved admins can view all products" ON public.products
  FOR SELECT TO authenticated USING (private.is_approved_admin(auth.uid()));
CREATE POLICY "Approved admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (private.is_approved_admin(auth.uid()));
CREATE POLICY "Approved admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (private.is_approved_admin(auth.uid()))
  WITH CHECK (private.is_approved_admin(auth.uid()));
CREATE POLICY "Approved admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (private.is_approved_admin(auth.uid()));

DROP POLICY "Admins can upload product images" ON storage.objects;
DROP POLICY "Admins can update product images" ON storage.objects;
DROP POLICY "Admins can delete product images" ON storage.objects;

CREATE POLICY "Approved admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND private.is_approved_admin(auth.uid()));
CREATE POLICY "Approved admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND private.is_approved_admin(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND private.is_approved_admin(auth.uid()));
CREATE POLICY "Approved admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND private.is_approved_admin(auth.uid()));

CREATE POLICY "Administrator allowlist is private" ON public.admin_allowlist
  FOR SELECT TO authenticated USING (false);

DROP FUNCTION public.has_role(uuid, public.app_role);