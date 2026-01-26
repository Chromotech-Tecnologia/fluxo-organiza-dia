-- Ajustar RPCs do Admin para refletir a mesma visibilidade de tarefas que o usuário final tem (inclui tarefas próprias + compartilhadas + atribuídas por time/colaboração).

CREATE OR REPLACE FUNCTION public.get_tasks_for_user(
  target_user_id uuid,
  start_date text,
  end_date text
)
RETURNS SETOF public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT DISTINCT t.*
  FROM public.tasks t
  WHERE t.scheduled_date >= start_date::date
    AND t.scheduled_date <= end_date::date
    AND (
      -- tarefas próprias
      t.user_id = target_user_id

      -- tarefas compartilhadas com o usuário
      OR EXISTS (
        SELECT 1
        FROM public.task_shares ts
        WHERE ts.task_id = t.id
          AND ts.shared_with_user_id = target_user_id
      )

      -- tarefas atribuídas a um team_member que pertence ao usuário
      OR (
        t.assigned_team_member_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.team_members tm
          WHERE tm.id = t.assigned_team_member_id
            AND tm.user_id = target_user_id
        )
      )

      -- tarefas atribuídas a um team_member em que o usuário é colaborador ativo
      OR (
        t.assigned_team_member_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.team_collaborations tc
          JOIN public.team_members tm ON tm.id = tc.team_member_id
          WHERE tm.id = t.assigned_team_member_id
            AND tc.collaborator_user_id = target_user_id
            AND tc.is_active = true
            AND EXISTS (
              SELECT 1
              FROM public.user_roles ur
              WHERE ur.user_id = tc.owner_user_id
                AND (
                  ur.is_permanent = true
                  OR (ur.trial_expires_at IS NOT NULL AND ur.trial_expires_at > now())
                )
            )
        )
      )
    )
  ORDER BY t.scheduled_date ASC, t.task_order ASC;
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_user_task_counts()
RETURNS TABLE(user_id uuid, total_tasks bigint, tasks_last_7_days bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  WITH users AS (
    SELECT p.id AS user_id
    FROM public.profiles p
  ),
  visibility AS (
    -- tarefas próprias
    SELECT t.user_id AS user_id, t.id AS task_id
    FROM public.tasks t

    UNION

    -- tarefas compartilhadas com o usuário
    SELECT ts.shared_with_user_id AS user_id, ts.task_id AS task_id
    FROM public.task_shares ts

    UNION

    -- tarefas atribuídas a team_member do usuário
    SELECT tm.user_id AS user_id, t.id AS task_id
    FROM public.tasks t
    JOIN public.team_members tm ON tm.id = t.assigned_team_member_id

    UNION

    -- tarefas atribuídas a team_member em que o usuário é colaborador ativo
    SELECT tc.collaborator_user_id AS user_id, t.id AS task_id
    FROM public.tasks t
    JOIN public.team_members tm ON tm.id = t.assigned_team_member_id
    JOIN public.team_collaborations tc ON tc.team_member_id = tm.id
    WHERE tc.is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = tc.owner_user_id
          AND (
            ur.is_permanent = true
            OR (ur.trial_expires_at IS NOT NULL AND ur.trial_expires_at > now())
          )
      )
  )
  SELECT
    u.user_id,
    COALESCE(COUNT(DISTINCT v.task_id), 0)::bigint AS total_tasks,
    COALESCE(
      COUNT(DISTINCT v.task_id) FILTER (WHERE t.created_at >= NOW() - INTERVAL '7 days'),
      0
    )::bigint AS tasks_last_7_days
  FROM users u
  LEFT JOIN visibility v ON v.user_id = u.user_id
  LEFT JOIN public.tasks t ON t.id = v.task_id
  GROUP BY u.user_id;
END;
$function$;