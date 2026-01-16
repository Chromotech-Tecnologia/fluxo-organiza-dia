-- Adicionar coluna notes na tabela team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Criar função para admin buscar tarefas de um usuário específico (bypass RLS)
CREATE OR REPLACE FUNCTION public.get_tasks_for_user(
  target_user_id uuid,
  start_date text,
  end_date text
)
RETURNS SETOF tasks
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
  SELECT t.*
  FROM tasks t
  WHERE t.user_id = target_user_id
    AND t.scheduled_date >= start_date::date
    AND t.scheduled_date <= end_date::date
  ORDER BY t.scheduled_date ASC, t.task_order ASC;
END;
$$;

-- Criar função para admin buscar membros da equipe de um usuário específico
CREATE OR REPLACE FUNCTION public.get_team_members_for_user(target_user_id uuid)
RETURNS SETOF team_members
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
  SELECT tm.*
  FROM team_members tm
  WHERE tm.user_id = target_user_id
  ORDER BY tm.name ASC;
END;
$$;

-- Criar função para admin buscar skills de um usuário específico
CREATE OR REPLACE FUNCTION public.get_skills_for_user(target_user_id uuid)
RETURNS SETOF skills
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
  SELECT s.*
  FROM skills s
  WHERE s.user_id = target_user_id
  ORDER BY s.name ASC;
END;
$$;

-- Criar função para admin buscar pessoas de um usuário específico
CREATE OR REPLACE FUNCTION public.get_people_for_user(target_user_id uuid)
RETURNS SETOF people
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
  SELECT p.*
  FROM people p
  WHERE p.user_id = target_user_id
  ORDER BY p.name ASC;
END;
$$;