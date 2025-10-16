-- Remove policies that allow admins to view/update/delete all tasks
-- Admins should only see their own tasks or shared tasks like regular users

DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete all tasks" ON public.tasks;

-- Remove admin policies from other tables as well to ensure isolation
DROP POLICY IF EXISTS "Admins can view all people" ON public.people;
DROP POLICY IF EXISTS "Admins can update all people" ON public.people;
DROP POLICY IF EXISTS "Admins can delete all people" ON public.people;

DROP POLICY IF EXISTS "Admins can view all skills" ON public.skills;
DROP POLICY IF EXISTS "Admins can update all skills" ON public.skills;
DROP POLICY IF EXISTS "Admins can delete all skills" ON public.skills;

DROP POLICY IF EXISTS "Admins can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update all team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete all team members" ON public.team_members;

DROP POLICY IF EXISTS "Admins can view all daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Admins can update all daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Admins can delete all daily reports" ON public.daily_reports;