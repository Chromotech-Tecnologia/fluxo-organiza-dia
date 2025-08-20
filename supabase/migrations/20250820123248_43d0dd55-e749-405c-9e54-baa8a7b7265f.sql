
-- Adicionar campo para marcar se tarefa foi repassada
ALTER TABLE tasks ADD COLUMN is_forwarded boolean DEFAULT false;

-- Adicionar campo para marcar se tarefa foi concluída (diferente de status)
ALTER TABLE tasks ADD COLUMN is_concluded boolean DEFAULT false;

-- Adicionar campo para data de conclusão
ALTER TABLE tasks ADD COLUMN concluded_at timestamp with time zone;

-- Criar índices para melhor performance
CREATE INDEX idx_tasks_is_forwarded ON tasks(is_forwarded);
CREATE INDEX idx_tasks_is_concluded ON tasks(is_concluded);
CREATE INDEX idx_tasks_concluded_at ON tasks(concluded_at);

-- Atualizar tarefas existentes baseado no histórico de repasses
UPDATE tasks 
SET is_forwarded = true 
WHERE forward_count > 0 OR jsonb_array_length(COALESCE(forward_history, '[]'::jsonb)) > 0;

-- Atualizar tarefas com status de repasse
UPDATE tasks 
SET is_forwarded = true 
WHERE status IN ('forwarded-date', 'forwarded-person');
