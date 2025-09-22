-- Migrar dados da tabela people para team_members
-- Consolidando pessoas e equipe em uma única entidade

-- 1. Primeiro, migrar os dados existentes de people para team_members
INSERT INTO team_members (
  user_id,
  name,
  email,
  phone,
  role,
  department,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  user_id,
  name,
  email,
  phone,
  role,
  department,
  CASE WHEN active THEN 'ativo' ELSE 'inativo' END as status,
  notes,
  created_at,
  updated_at
FROM people
WHERE NOT EXISTS (
  SELECT 1 FROM team_members tm 
  WHERE tm.user_id = people.user_id 
  AND tm.name = people.name 
  AND tm.email = people.email
);

-- 2. Atualizar referências nas tarefas
-- Criar uma tabela temporária para mapear IDs de people para team_members
CREATE TEMP TABLE people_to_team_mapping AS
SELECT 
  p.id as people_id,
  tm.id as team_member_id
FROM people p
JOIN team_members tm ON (
  p.user_id = tm.user_id 
  AND p.name = tm.name 
  AND COALESCE(p.email, '') = COALESCE(tm.email, '')
);

-- 3. Atualizar as tarefas para usar team_member_id em vez de assigned_person_id
-- Primeiro, adicionar a nova coluna
ALTER TABLE tasks ADD COLUMN assigned_team_member_id uuid REFERENCES team_members(id);

-- Migrar os dados
UPDATE tasks SET assigned_team_member_id = ptm.team_member_id
FROM people_to_team_mapping ptm
WHERE tasks.assigned_person_id = ptm.people_id;

-- 4. Comentar a tabela people (não deletar ainda para segurança)
COMMENT ON TABLE people IS 'DEPRECATED: Dados migrados para team_members. Esta tabela pode ser removida após confirmação.';

-- 5. Atualizar as políticas RLS para a nova coluna
CREATE POLICY "Users can view tasks assigned to their team members" 
ON tasks 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR (assigned_team_member_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.id = assigned_team_member_id 
    AND tm.user_id = auth.uid()
  ))
);

-- 6. Adicionar índice para performance
CREATE INDEX idx_tasks_assigned_team_member_id ON tasks(assigned_team_member_id);

-- 7. Comentários para documentação
COMMENT ON COLUMN tasks.assigned_person_id IS 'DEPRECATED: Use assigned_team_member_id instead';
COMMENT ON COLUMN tasks.assigned_team_member_id IS 'References team_members table - consolidates people and team functionality';