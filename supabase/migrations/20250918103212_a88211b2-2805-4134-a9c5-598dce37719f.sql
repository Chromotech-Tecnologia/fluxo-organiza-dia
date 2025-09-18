-- Create index for optimizing task queries by user_id and scheduled_date
-- This will significantly improve performance for date-range queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_scheduled_date 
ON public.tasks (user_id, scheduled_date);