import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMemberFilter } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';

export function useSupabaseTeamMembers(filters?: TeamMemberFilter) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Carregar membros do Supabase
  const loadTeamMembers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      // Aplicar filtros no Supabase
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Converter dados do Supabase para o tipo TeamMember
      let convertedMembers: TeamMember[] = (data || []).map(member => ({
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
        isPartner: false, // default
        origin: '',
        projects: [],
        createdAt: member.created_at,
        updatedAt: member.updated_at
      }));

      // Aplicar filtros no frontend (para filtros mais complexos)
      if (filters) {
        convertedMembers = applyFilters(convertedMembers, filters);
      }

      setTeamMembers(convertedMembers);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar membros da equipe: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = (members: TeamMember[], filters: TeamMemberFilter): TeamMember[] => {
    return members.filter(member => {
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

      // Filtro por skills
      if (filters.skillIds && filters.skillIds.length > 0) {
        const hasMatchingSkill = filters.skillIds.some(skillId => 
          member.skillIds.includes(skillId)
        );
        if (!hasMatchingSkill) return false;
      }

      return true;
    });
  };

  // Adicionar novo membro
  const addTeamMember = async (newTeamMember: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
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
          project_ids: [],
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
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar membro
  const updateTeamMember = async (teamMemberId: string, updates: Partial<TeamMember>) => {
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
          project_ids: [],
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
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar membro
  const deleteTeamMember = async (teamMemberId: string) => {
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
      toast({
        title: "Erro",
        description: "Erro ao remover membro da equipe: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Obter membro por ID
  const getTeamMemberById = (teamMemberId: string): TeamMember | undefined => {
    return teamMembers.find(tm => tm.id === teamMemberId);
  };

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
          () => {
            console.log('Team members changed, reloading...');
            loadTeamMembers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [filters, user?.id]);

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
