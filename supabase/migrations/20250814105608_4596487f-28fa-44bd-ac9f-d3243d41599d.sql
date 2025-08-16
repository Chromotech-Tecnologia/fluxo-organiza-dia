-- Adicionar ordem de prioridade numérica às tarefas
ALTER TABLE tasks ADD COLUMN order_index INTEGER DEFAULT 0;

-- Criar índice para melhor performance na ordenação
CREATE INDEX idx_tasks_order_index ON tasks (order_index);

-- Trigger para atualizar updated_at quando order_index muda
CREATE TRIGGER update_tasks_order_updated_at
    BEFORE UPDATE OF order_index ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();