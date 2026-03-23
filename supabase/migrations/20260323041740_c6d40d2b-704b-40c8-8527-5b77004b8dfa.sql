
-- RPC: get_or_create_contact
CREATE OR REPLACE FUNCTION public.get_or_create_contact(p_email text)
RETURNS TABLE(contact_id uuid, account_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
  v_account_id uuid;
BEGIN
  SELECT c.id, c.account_id INTO v_contact_id, v_account_id
  FROM contacts c
  WHERE c.email = p_email
  LIMIT 1;

  IF v_contact_id IS NOT NULL THEN
    RETURN QUERY SELECT v_contact_id, v_account_id;
    RETURN;
  END IF;

  INSERT INTO accounts (company_name, account_type)
  VALUES (split_part(p_email, '@', 2), 'self_serve')
  RETURNING id INTO v_account_id;

  INSERT INTO contacts (email, full_name, account_id)
  VALUES (p_email, split_part(p_email, '@', 1), v_account_id)
  RETURNING id INTO v_contact_id;

  RETURN QUERY SELECT v_contact_id, v_account_id;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_or_create_contact(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_contact(text) TO authenticated;

-- RLS: allow anon+authenticated to SELECT profiles
CREATE POLICY "Anyone can read profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- RLS: allow anon+authenticated to SELECT profile_components
CREATE POLICY "Anyone can read profile_components"
ON public.profile_components FOR SELECT
TO anon, authenticated
USING (true);

-- RLS: allow anon+authenticated to SELECT components
CREATE POLICY "Anyone can read components"
ON public.components FOR SELECT
TO anon, authenticated
USING (true);
