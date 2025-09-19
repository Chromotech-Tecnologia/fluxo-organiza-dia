-- Corrigir função para incluir search_path correto
CREATE OR REPLACE FUNCTION public.set_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir role padrão com trial de 7 dias
  INSERT INTO public.user_roles (user_id, role, trial_expires_at)
  VALUES (NEW.id, 'user', NOW() + INTERVAL '7 days');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;