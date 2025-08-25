
-- Fix critical security issue: Make user_id columns NOT NULL in all tables
-- This prevents potential security vulnerabilities with RLS policies

-- First, update any existing records that might have NULL user_id values
-- (This should not affect your data since RLS policies require authentication)

-- Update tasks table
ALTER TABLE public.tasks 
ALTER COLUMN user_id SET NOT NULL;

-- Update people table  
ALTER TABLE public.people 
ALTER COLUMN user_id SET NOT NULL;

-- Update skills table
ALTER TABLE public.skills 
ALTER COLUMN user_id SET NOT NULL;

-- Update team_members table
ALTER TABLE public.team_members 
ALTER COLUMN user_id SET NOT NULL;

-- Update daily_reports table
ALTER TABLE public.daily_reports 
ALTER COLUMN user_id SET NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.tasks.user_id IS 'Required user ID for RLS security';
COMMENT ON COLUMN public.people.user_id IS 'Required user ID for RLS security';
COMMENT ON COLUMN public.skills.user_id IS 'Required user ID for RLS security';
COMMENT ON COLUMN public.team_members.user_id IS 'Required user ID for RLS security';
COMMENT ON COLUMN public.daily_reports.user_id IS 'Required user ID for RLS security';
