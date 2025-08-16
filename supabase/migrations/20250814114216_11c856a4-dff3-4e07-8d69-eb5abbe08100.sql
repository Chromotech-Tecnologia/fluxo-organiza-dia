-- Enable real-time updates for all tables
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.people REPLICA IDENTITY FULL;
ALTER TABLE public.skills REPLICA IDENTITY FULL;
ALTER TABLE public.team_members REPLICA IDENTITY FULL;
ALTER TABLE public.daily_reports REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_reports;