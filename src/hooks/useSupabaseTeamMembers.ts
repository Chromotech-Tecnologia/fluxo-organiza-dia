
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMemberFilter } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';

export function useSupabaseTeamMembers(filters?: TeamMemberFilter) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Carregar membros do Supabase (sem filtros)
  const loadTeamMembers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      // Converter dados do Supabase para o tipo TeamMember
      const convertedMembers: TeamMember[] = (data || []).map(member => ({
        id: member.id,
        name: member.name,
        role: member.role || '',
        email: member.email || '',
        phone: member.phone || '',
        address: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: ''
        },
        skillIds: member.skill_ids || [],
        status: member.status as 'ativo' | 'inativo',
        isPartner: false,
        origin: '',
        projects: Array.isArray((member as any).projects) 
          ? (member as any).projects 
          : typeof (member as any).projects === 'string' 
            ? JSON.parse((member as any).projects) 
            : [],
        createdAt: member.created_at,
        updatedAt: member.updated_at
      }));

      setAllTeamMembers(convertedMembers);
    } catch (error: any) {
      console.error('Error loading team members:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar membros da equipe: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Aplicar filtros usando useMemo para otimização
  const filteredTeamMembers = useMemo(() => {    
    if (!filters || (!filters.search && !filters.status && (!filters.skillIds || filters.skillIds.length === 0))) {
      return allTeamMembers;
    }

    return allTeamMembers.filter(member => {
      // Filtro de busca por texto
      if (filters.search) {
        const lowercaseSearch = filters.search.toLowerCase();
        const matchesSearch = 
          member.name.toLowerCase().includes(lowercaseSearch) ||
          member.role.toLowerCase().includes(lowercaseSearch) ||
          member.email.toLowerCase().includes(lowercaseSearch) ||
          member.origin.toLowerCase().includes(lowercaseSearch);
        
        if (!matchesSearch) return false;
      }

      // Filtro por status
      if (filters.status && member.status !== filters.status) {
        return false;
      }

      // Filtro por skills
      if (filters.skillIds && filters.skillIds.length > 0) {
        const hasMatchingSkill = filters.skillIds.some(skillId => 
          member.skillIds.includes(skillId)
        );
        if (!hasMatchingSkill) return false;
      }

      return true;
    });
  }, [allTeamMembers, filters]);

  // Atualizar teamMembers quando os filtros mudarem
  useEffect(() => {
    setTeamMembers(filteredTeamMembers);
  }, [filteredTeamMembers]);

  // Adicionar novo membro
  const addTeamMember = useCallback(async (newTeamMember: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          name: newTeamMember.name,
          role: newTeamMember.role,
          email: newTeamMember.email,
          phone: newTeamMember.phone,
          department: '',
          skill_ids: newTeamMember.skillIds,
          projects: JSON.stringify(newTeamMember.projects || []),
          project_ids: (newTeamMember.projects || []).map(p => p.id),
          hire_date: null,
          status: newTeamMember.status,
          notes: '',
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro da equipe adicionado com sucesso!"
      });
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [user?.id, loadTeamMembers]);

  // Atualizar membro
  const updateTeamMember = useCallback(async (teamMemberId: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: updates.name,
          role: updates.role,
          email: updates.email,
          phone: updates.phone,
          department: '',
          skill_ids: updates.skillIds,
          projects: JSON.stringify(updates.projects || []),
          project_ids: (updates.projects || []).map(p => p.id),
          hire_date: null,
          status: updates.status,
          notes: ''
        })
        .eq('id', teamMemberId);

      if (error) throw error;

      await loadTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro da equipe atualizado com sucesso!"
      });
    } catch (error: any) {
      console.error('Error updating team member:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [loadTeamMembers]);

  // Deletar membro
  const deleteTeamMember = useCallback(async (teamMemberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', teamMemberId);

      if (error) throw error;

      await loadTeamMembers();
      
      toast({
        title: "Sucesso",
        description: "Membro da equipe removido com sucesso!"
      });
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [loadTeamMembers]);

  // Obter membro por ID
  const getTeamMemberById = useCallback((teamMemberId: string): TeamMember | undefined => {
    return teamMembers.find(tm => tm.id === teamMemberId);
  }, [teamMembers]);

  // Carregamento inicial e setup de real-time apenas quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadTeamMembers();
      
      // Setup real-time subscription  
      const channel = supabase
        .channel('team-members-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_members',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            // Reload data quando há mudanças via real-time
            loadTeamMembers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, loadTeamMembers]);

  return {
    teamMembers,
    loading,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getTeamMemberById,
    refetch: loadTeamMembers
  };
}
