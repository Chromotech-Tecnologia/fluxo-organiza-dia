-- Adicionar trial de 7 dias por padrão para novos usuários
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');

-- Função para definir trial automático para novos usuários
CREATE OR REPLACE FUNCTION public.set_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir role padrão com trial de 7 dias
  INSERT INTO public.user_roles (user_id, role, trial_expires_at)
  VALUES (NEW.id, 'user', NOW() + INTERVAL '7 days');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para definir trial automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_set_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_set_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_user_trial();