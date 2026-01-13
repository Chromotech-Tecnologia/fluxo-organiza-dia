-- Adicionar colunas para endereço, origem e is_partner na tabela team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS origin text DEFAULT '',
ADD COLUMN IF NOT EXISTS is_partner boolean DEFAULT false;

-- Criar função para retornar estatísticas de tarefas por usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_user_task_counts()
RETURNS TABLE(user_id uuid, total_tasks bigint, tasks_last_7_days bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    t.user_id,
    COUNT(*)::bigint as total_tasks,
    COUNT(*) FILTER (WHERE t.created_at >= NOW() - INTERVAL '7 days')::bigint as tasks_last_7_days
  FROM tasks t
  GROUP BY t.user_id;
END;
$$;