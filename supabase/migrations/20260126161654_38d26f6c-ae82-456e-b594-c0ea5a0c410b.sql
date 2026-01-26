-- Remover a política simples que conflita com a política de compartilhamento
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;

-- A política "Users can view own tasks and shared tasks" já cobre todos os casos:
-- 1. Tarefas próprias (user_id = auth.uid())
-- 2. Tarefas compartilhadas via task_shares
-- 3. Tarefas delegadas via team_members
-- 4. Tarefas via team_collaborations