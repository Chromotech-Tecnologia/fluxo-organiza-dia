-- Criar tabela de pessoas
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de habilidades
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros da equipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  skill_ids TEXT[] DEFAULT '{}',
  project_ids TEXT[] DEFAULT '{}',
  hire_date DATE,
  status TEXT DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  time_investment TEXT DEFAULT 'low',
  category TEXT DEFAULT 'personal',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_person_id UUID REFERENCES public.people(id),
  forward_count INTEGER DEFAULT 0,
  observations TEXT,
  sub_items JSONB DEFAULT '[]',
  completion_history JSONB DEFAULT '[]',
  forward_history JSONB DEFAULT '[]',
  delivery_dates TEXT[] DEFAULT '{}',
  is_routine BOOLEAN DEFAULT false,
  routine_config JSONB,
  task_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relatórios diários
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  forwarded_tasks INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (acesso total por enquanto, pode ser ajustado depois)
CREATE POLICY "Allow all operations for authenticated users" ON public.people FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.skills FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.daily_reports FOR ALL USING (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at em todas as tabelas
CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON public.people
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at
    BEFORE UPDATE ON public.daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();