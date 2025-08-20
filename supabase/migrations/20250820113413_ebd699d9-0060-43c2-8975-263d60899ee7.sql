
-- Atribuir todos os dados existentes para o usuário alexandre@chromotech.com.br

-- Primeiro, vamos verificar se o usuário existe e obter seu ID
-- Se não existir, precisaremos criá-lo manualmente
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Tentar encontrar o usuário pelo email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'alexandre@chromotech.com.br';
    
    -- Se o usuário não existir, criar um perfil com um UUID fixo
    -- (O usuário real precisará se registrar normalmente)
    IF target_user_id IS NULL THEN
        target_user_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID;
        
        -- Inserir um perfil temporário
        INSERT INTO public.profiles (id, name, email, created_at, updated_at)
        VALUES (
            target_user_id,
            'Alexandre',
            'alexandre@chromotech.com.br',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            updated_at = NOW();
    END IF;
    
    -- Atualizar todas as tabelas para usar este user_id
    
    -- Atualizar tarefas
    UPDATE public.tasks 
    SET user_id = target_user_id 
    WHERE user_id IS NULL OR user_id != target_user_id;
    
    -- Atualizar pessoas
    UPDATE public.people 
    SET user_id = target_user_id 
    WHERE user_id IS NULL OR user_id != target_user_id;
    
    -- Atualizar habilidades
    UPDATE public.skills 
    SET user_id = target_user_id 
    WHERE user_id IS NULL OR user_id != target_user_id;
    
    -- Atualizar membros da equipe
    UPDATE public.team_members 
    SET user_id = target_user_id 
    WHERE user_id IS NULL OR user_id != target_user_id;
    
    -- Atualizar relatórios diários
    UPDATE public.daily_reports 
    SET user_id = target_user_id 
    WHERE user_id IS NULL OR user_id != target_user_id;
    
    -- Mostrar resultados
    RAISE NOTICE 'Dados atribuídos ao usuário ID: %', target_user_id;
    RAISE NOTICE 'Tarefas atualizadas: %', (SELECT COUNT(*) FROM public.tasks WHERE user_id = target_user_id);
    RAISE NOTICE 'Pessoas atualizadas: %', (SELECT COUNT(*) FROM public.people WHERE user_id = target_user_id);
    RAISE NOTICE 'Habilidades atualizadas: %', (SELECT COUNT(*) FROM public.skills WHERE user_id = target_user_id);
    RAISE NOTICE 'Membros da equipe atualizados: %', (SELECT COUNT(*) FROM public.team_members WHERE user_id = target_user_id);
    RAISE NOTICE 'Relatórios diários atualizados: %', (SELECT COUNT(*) FROM public.daily_reports WHERE user_id = target_user_id);
END $$;
