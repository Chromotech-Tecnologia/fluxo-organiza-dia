import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

interface UserWithProfile {
  id: string;
  email: string;
  name?: string;
  roles: AppRole[];
  created_at: string;
  last_sign_in_at?: string;
}

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuthStore();

  // Check if current user is admin
  const checkIsAdmin = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data || false);
      return data || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Load all users with their profiles and roles
  const loadAllUsers = async () => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithProfile[] = (profiles || []).map(profile => {
        const userRoles = (roles || [])
          .filter(role => role.user_id === profile.id)
          .map(role => role.role as AppRole);

        return {
          id: profile.id,
          email: profile.email || '',
          name: profile.name || '',
          roles: userRoles.length > 0 ? userRoles : ['user'],
          created_at: profile.created_at || '',
          last_sign_in_at: null
        };
      });

      setAllUsers(usersWithRoles);
      setUserRoles(roles || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add role to user
  const addRoleToUser = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Role ${role} adicionada ao usuário`
      });

      loadAllUsers();
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar role",
        variant: "destructive"
      });
    }
  };

  // Remove role from user
  const removeRoleFromUser = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .match({ user_id: userId, role: role });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Role ${role} removida do usuário`
      });

      loadAllUsers();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover role",
        variant: "destructive"
      });
    }
  };

  // Create new user (admin only)
  const createUser = async (email: string, password: string, name: string, role: AppRole = 'user') => {
    try {
      // This would require admin API access or edge function
      // For now, we'll just show that it should be implemented
      toast({
        title: "Aviso",
        description: "Criação de usuários deve ser implementada via função edge",
        variant: "destructive"
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive"
      });
    }
  };

  // Disable/enable user (by removing/adding roles)
  const toggleUserStatus = async (userId: string, disabled: boolean) => {
    try {
      if (disabled) {
        // Remove all roles to disable user
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Add default user role to enable
        await addRoleToUser(userId, 'user');
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${disabled ? 'desabilitado' : 'habilitado'} com sucesso`
      });

      loadAllUsers();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkIsAdmin().then(adminStatus => {
        if (adminStatus) {
          loadAllUsers();
        }
      });
    }
  }, [user]);

  return {
    userRoles,
    allUsers,
    loading,
    isAdmin,
    checkIsAdmin,
    loadAllUsers,
    addRoleToUser,
    removeRoleFromUser,
    createUser,
    toggleUserStatus,
    refetch: loadAllUsers
  };
}