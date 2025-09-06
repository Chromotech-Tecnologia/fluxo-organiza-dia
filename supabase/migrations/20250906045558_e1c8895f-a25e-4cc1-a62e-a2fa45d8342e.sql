-- Inserir role 'admin' para o usuário atual
INSERT INTO public.user_roles (user_id, role) 
VALUES ('7d19ce34-884c-4fe3-a2c2-afcb524fd802', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;