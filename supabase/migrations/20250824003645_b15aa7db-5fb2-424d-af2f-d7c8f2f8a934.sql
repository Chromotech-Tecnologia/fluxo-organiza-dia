
-- Adicionar a coluna custom_time_minutes na tabela tasks
ALTER TABLE public.tasks 
ADD COLUMN custom_time_minutes integer;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.tasks.custom_time_minutes IS 'Tempo personalizado em minutos quando time_investment é "custom"';
