
-- Corrigir a foreign key constraint para permitir tanto pessoas quanto membros da equipe
-- Primeiro, vamos remover a constraint existente se existir
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_person_id_fkey;

-- Como temos duas tabelas (people e team_members), não podemos ter uma FK rígida
-- Vamos apenas garantir que o campo permita UUIDs válidos
-- A validação será feita no código da aplicação
