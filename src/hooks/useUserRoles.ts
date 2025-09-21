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
  email_confirmed_at?: string;
  email_confirmed?: boolean;
  phone_confirmed?: boolean;
  has_profile?: boolean;
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

  // Load all users from auth system with their profiles and roles
  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Call edge function to get all users from auth
      const response = await fetch('https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/admin-manage-users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load users');
      }

      const { users } = await response.json();
      
      // Get all user roles for local state
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      setAllUsers(users || []);
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

  // Confirm user email manually
  const confirmUserEmail = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/admin-manage-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'confirm_email',
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm email');
      }

      toast({
        title: "Sucesso",
        description: "Email confirmado com sucesso"
      });

      loadAllUsers();
    } catch (error: any) {
      console.error('Error confirming email:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao confirmar email",
        variant: "destructive"
      });
    }
  };

  // Create missing profile for user
  const createMissingProfile = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/admin-manage-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_missing_profile',
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      toast({
        title: "Sucesso",
        description: "Perfil criado com sucesso"
      });

      loadAllUsers();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar perfil",
        variant: "destructive"
      });
    }
  };

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
    confirmUserEmail,
    createMissingProfile,
    refetch: loadAllUsers
  };
}