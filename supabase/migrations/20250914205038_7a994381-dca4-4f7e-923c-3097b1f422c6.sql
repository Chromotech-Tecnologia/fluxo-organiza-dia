-- Add trial period functionality to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN is_permanent BOOLEAN DEFAULT false;

-- Create function to check if user is in trial period
CREATE OR REPLACE FUNCTION public.is_user_in_trial(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND trial_expires_at IS NOT NULL
      AND trial_expires_at > now()
      AND is_permanent = false
  )
$$;

-- Create function to get trial days remaining
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id 
        AND trial_expires_at IS NOT NULL 
        AND trial_expires_at > now()
        AND is_permanent = false
    ) THEN
      GREATEST(0, EXTRACT(days FROM (
        SELECT trial_expires_at FROM public.user_roles 
        WHERE user_id = _user_id 
          AND trial_expires_at IS NOT NULL 
        LIMIT 1
      ) - now())::integer)
    ELSE 0
  END
$$;