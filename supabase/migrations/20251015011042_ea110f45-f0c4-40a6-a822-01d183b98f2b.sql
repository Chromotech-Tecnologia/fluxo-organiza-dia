-- Allow recipients of task shares to view the sharer's basic profile (name/email)
-- Adds a selective SELECT policy on profiles
CREATE POLICY "Users can view profiles of owners who shared tasks with them"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.task_shares ts
    WHERE ts.owner_user_id = profiles.id
      AND ts.shared_with_user_id = auth.uid()
  )
);