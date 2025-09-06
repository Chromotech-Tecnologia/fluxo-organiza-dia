-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Add admin access policies to existing tables

-- Tasks: Allow admins to see all tasks
CREATE POLICY "Admins can view all tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can delete all tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- People: Allow admins to see all people
CREATE POLICY "Admins can view all people" 
ON public.people 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all people" 
ON public.people 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can delete all people" 
ON public.people 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Skills: Allow admins to see all skills
CREATE POLICY "Admins can view all skills" 
ON public.skills 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all skills" 
ON public.skills 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can delete all skills" 
ON public.skills 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Team Members: Allow admins to see all team members
CREATE POLICY "Admins can view all team members" 
ON public.team_members 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all team members" 
ON public.team_members 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can delete all team members" 
ON public.team_members 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Daily Reports: Allow admins to see all daily reports
CREATE POLICY "Admins can view all daily reports" 
ON public.daily_reports 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all daily reports" 
ON public.daily_reports 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can delete all daily reports" 
ON public.daily_reports 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Profiles: Allow admins to see all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- User roles policies
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Trigger for updated_at on roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert first admin role (replace with your user ID after first login)
-- This will need to be done manually for the first admin user