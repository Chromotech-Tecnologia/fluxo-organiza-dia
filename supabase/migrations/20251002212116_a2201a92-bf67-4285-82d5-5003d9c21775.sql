-- Criar enum para status de convites
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Tabela de convites de equipe
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  invitation_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de colaborações ativas
CREATE TABLE public.team_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  collaborator_user_id UUID NOT NULL,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id, collaborator_user_id, team_member_id)
);

-- Adicionar campos à tabela team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS is_external_collaborator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS collaborator_user_id UUID;

-- Adicionar campos à tabela tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS delegated_by_user_id UUID,
ADD COLUMN IF NOT EXISTS is_external_delegation BOOLEAN DEFAULT false;

-- Habilitar RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies para team_invitations
CREATE POLICY "Users can view invitations they sent"
  ON public.team_invitations FOR SELECT
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can view invitations sent to their email"
  ON public.team_invitations FOR SELECT
  USING (
    recipient_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their sent invitations"
  ON public.team_invitations FOR UPDATE
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Recipients can update invitations sent to them"
  ON public.team_invitations FOR UPDATE
  USING (
    recipient_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all invitations"
  ON public.team_invitations FOR SELECT
  USING (is_admin());

-- RLS Policies para team_collaborations
CREATE POLICY "Owners can view their collaborations"
  ON public.team_collaborations FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Collaborators can view their collaborations"
  ON public.team_collaborations FOR SELECT
  USING (auth.uid() = collaborator_user_id);

CREATE POLICY "Owners can insert collaborations"
  ON public.team_collaborations FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their collaborations"
  ON public.team_collaborations FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete their collaborations"
  ON public.team_collaborations FOR DELETE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all collaborations"
  ON public.team_collaborations FOR SELECT
  USING (is_admin());

-- Atualizar policy de tasks para incluir tarefas delegadas
DROP POLICY IF EXISTS "Users can view tasks assigned to their team members" ON public.tasks;

CREATE POLICY "Users can view tasks assigned to their team members or delegated to them"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    (
      assigned_team_member_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.id = tasks.assigned_team_member_id 
        AND tm.user_id = auth.uid()
      )
    )
    OR
    (
      assigned_team_member_id IS NOT NULL
      AND EXISTS (
        SELECT 1 
        FROM team_collaborations tc
        INNER JOIN team_members tm ON tc.team_member_id = tm.id
        WHERE tm.id = tasks.assigned_team_member_id
          AND tc.collaborator_user_id = auth.uid()
          AND tc.is_active = true
          AND EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = tc.owner_user_id
            AND (
              ur.is_permanent = true 
              OR (ur.trial_expires_at IS NOT NULL AND ur.trial_expires_at > now())
            )
          )
      )
    )
  );

-- Atualizar policy de team_members para colaboradores
DROP POLICY IF EXISTS "Users can view own team members" ON public.team_members;

CREATE POLICY "Users can view own team members or teams they collaborate with"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    auth.uid() = collaborator_user_id
    OR
    EXISTS (
      SELECT 1 FROM team_collaborations tc
      WHERE tc.team_member_id = team_members.id
      AND tc.collaborator_user_id = auth.uid()
    )
  );

-- Função para verificar status de contas em colaborações
CREATE OR REPLACE FUNCTION public.check_collaboration_account_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_collaborations tc
  SET is_active = EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = tc.owner_user_id
    AND (
      ur.is_permanent = true 
      OR (ur.trial_expires_at IS NOT NULL AND ur.trial_expires_at > now())
    )
  ),
  updated_at = now()
  WHERE tc.is_active != EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = tc.owner_user_id
    AND (
      ur.is_permanent = true 
      OR (ur.trial_expires_at IS NOT NULL AND ur.trial_expires_at > now())
    )
  );
END;
$$;

-- Trigger para atualizar updated_at em team_invitations
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em team_collaborations
CREATE TRIGGER update_team_collaborations_updated_at
  BEFORE UPDATE ON public.team_collaborations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_team_invitations_recipient_email ON public.team_invitations(recipient_email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(invitation_token);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);
CREATE INDEX idx_team_collaborations_collaborator ON public.team_collaborations(collaborator_user_id);
CREATE INDEX idx_team_collaborations_owner ON public.team_collaborations(owner_user_id);
CREATE INDEX idx_team_members_collaborator ON public.team_members(collaborator_user_id);
CREATE INDEX idx_tasks_delegated_by ON public.tasks(delegated_by_user_id);