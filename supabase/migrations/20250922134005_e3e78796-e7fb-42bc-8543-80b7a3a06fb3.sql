-- Adicionar coluna projects para armazenar dados completos dos projetos
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

-- Criar índice para melhor performance na coluna projects
CREATE INDEX IF NOT EXISTS idx_team_members_projects ON public.team_members USING GIN(projects);

-- Migrar dados existentes de project_ids para projects (se houver)
UPDATE public.team_members 
SET projects = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', project_id,
      'name', 'Projeto sem nome',
      'status', 'apresentado'
    )
  )
  FROM unnest(project_ids) AS project_id
  WHERE project_ids IS NOT NULL AND array_length(project_ids, 1) > 0
)
WHERE projects = '[]'::jsonb AND project_ids IS NOT NULL AND array_length(project_ids, 1) > 0;