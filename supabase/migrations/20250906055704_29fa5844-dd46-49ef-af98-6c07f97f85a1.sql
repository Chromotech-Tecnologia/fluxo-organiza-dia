-- Add debug logging and improve admin access
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE(
  current_user_id uuid,
  current_role text,
  is_admin_result boolean,
  has_admin_role boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    auth.uid() as current_user_id,
    current_setting('role', true) as current_role,
    public.is_admin() as is_admin_result,
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) as has_admin_role;
$$;

-- Create a more robust admin check function that works in different contexts
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    -- First check if we have a specific user_id provided
    CASE 
      WHEN check_user_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = check_user_id AND role = 'admin'
        )
      ELSE FALSE
    END,
    -- Then check current authenticated user
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ),
    FALSE
  );
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;