import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuthStore();

  // Carregar perfil do usuário
  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Perfil não existe, criar um
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Criar perfil se não existir
  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
        email: user.email || null
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast.error('Erro ao criar perfil');
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: { name?: string; email?: string }) => {
    if (!user || !profile) return false;

    try {
      setUpdating(true);

      // Atualizar perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Se o email foi alterado, atualizar também no auth
      if (updates.email && updates.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email
        });

        if (authError) {
          // Se falhou ao atualizar o email no auth, reverter a mudança no perfil
          await supabase
            .from('profiles')
            .update({ email: profile.email })
            .eq('id', user.id);
          
          throw authError;
        }
      }

      setProfile(profileData);
      toast.success('Perfil atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Alterar senha
  const updatePassword = async (newPassword: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao alterar senha');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    updatePassword,
    loadProfile
  };
}