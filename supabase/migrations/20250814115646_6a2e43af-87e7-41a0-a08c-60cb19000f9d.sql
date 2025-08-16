-- Corrigir dados inconsistentes de repasse de tarefas

-- 1. Atualizar scheduled_date das tarefas originais para corresponder ao originalDate no forward_history
UPDATE tasks 
SET scheduled_date = (forward_history->0->>'originalDate')::date,
    forward_count = jsonb_array_length(forward_history),
    updated_at = now()
WHERE forward_history IS NOT NULL 
  AND forward_history != '[]'::jsonb 
  AND scheduled_date != (forward_history->0->>'originalDate')::date;

-- 2. Atualizar forward_count para todas as tarefas com forward_history
UPDATE tasks 
SET forward_count = jsonb_array_length(forward_history),
    updated_at = now()
WHERE forward_history IS NOT NULL 
  AND forward_history != '[]'::jsonb 
  AND forward_count != jsonb_array_length(forward_history);

-- 3. Criar tarefas de destino que estão faltando
-- Para cada repasse no forward_history, verificar se existe uma tarefa na data de destino
WITH forwarded_tasks AS (
  SELECT 
    t.id as original_id,
    t.title,
    t.description,
    t.type,
    t.priority,
    t.time_investment,
    t.category,
    t.assigned_person_id,
    t.sub_items,
    t.delivery_dates,
    t.observations,
    t.task_order,
    t.is_routine,
    t.routine_config,
    t.is_recurrent,
    forward_record->>'newDate' as new_date,
    forward_record->>'originalDate' as original_date,
    forward_record->>'forwardedAt' as forwarded_at
  FROM tasks t
  CROSS JOIN jsonb_array_elements(t.forward_history) as forward_record
  WHERE t.forward_history IS NOT NULL 
    AND t.forward_history != '[]'::jsonb
),
missing_targets AS (
  SELECT DISTINCT ft.*
  FROM forwarded_tasks ft
  LEFT JOIN tasks target_task ON target_task.scheduled_date = ft.new_date::date 
    AND target_task.title = ft.title
  WHERE target_task.id IS NULL
)
INSERT INTO tasks (
  title, description, type, priority, time_investment, category,
  assigned_person_id, sub_items, delivery_dates, observations,
  task_order, is_routine, routine_config, is_recurrent,
  scheduled_date, status, forward_history, completion_history, forward_count
)
SELECT 
  title, description, type, priority, time_investment, category,
  assigned_person_id, sub_items, delivery_dates, observations,
  task_order, is_routine, routine_config, is_recurrent,
  new_date::date as scheduled_date, 
  'pending' as status,
  '[]'::jsonb as forward_history,
  '[]'::jsonb as completion_history,
  0 as forward_count
FROM missing_targets;