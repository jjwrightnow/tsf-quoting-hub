CREATE POLICY "Public can read operator_config"
ON public.operator_config
FOR SELECT
TO anon, authenticated
USING (true);