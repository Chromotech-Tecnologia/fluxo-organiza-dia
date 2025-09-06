-- Add debug logging function
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE(
  current_user_id uuid,
  user_role text,
  is_admin_result boolean,
  has_admin_role boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    auth.uid() as current_user_id,
    current_setting('role', true) as user_role,
    public.is_admin() as is_admin_result,
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) as has_admin_role;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;