import { useState, useEffect } from 'react';
import { TeamMember, TeamMemberFilter } from '@/types';
import { teamMembersStorage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export function useTeamMembers(filters?: TeamMemberFilter) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar membros do storage
  const loadTeamMembers = () => {
    setLoading(true);
    try {
      let allTeamMembers = teamMembersStorage.getAll();
      
      // Aplicar filtros se fornecidos
      if (filters) {
        allTeamMembers = applyFilters(allTeamMembers, filters);
      }
      
      setTeamMembers(allTeamMembers);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar membros da equipe",
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
  };

  // Adicionar novo membro
  const addTeamMember = (newTeamMember: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const teamMember: TeamMember = {
      ...newTeamMember,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    teamMembersStorage.add(teamMember);
    loadTeamMembers();
    
    toast({
      title: "Sucesso",
      description: "Membro da equipe adicionado com sucesso!"
    });
  };

  // Atualizar membro
  const updateTeamMember = (teamMemberId: string, updates: Partial<TeamMember>) => {
    teamMembersStorage.update(teamMemberId, updates);
    loadTeamMembers();
    
    toast({
      title: "Sucesso",
      description: "Membro da equipe atualizado com sucesso!"
    });
  };

  // Deletar membro
  const deleteTeamMember = (teamMemberId: string) => {
    teamMembersStorage.delete(teamMemberId);
    loadTeamMembers();
    
    toast({
      title: "Sucesso",
      description: "Membro da equipe removido com sucesso!"
    });
  };

  // Obter membro por ID
  const getTeamMemberById = (teamMemberId: string): TeamMember | undefined => {
    return teamMembers.find(tm => tm.id === teamMemberId);
  };

  // Obter contagem de projetos por status
  const getProjectStats = (teamMember: TeamMember) => {
    const stats = {
      apresentado: 0,
      cotado: 0,
      iniciado: 0,
      finalizado: 0,
      total: teamMember.projects.length
    };

    teamMember.projects.forEach(project => {
      stats[project.status]++;
    });

    return stats;
  };

  // Obter total de habilidades
  const getSkillsCount = (teamMember: TeamMember): number => {
    return teamMember.skillIds.length;
  };

  useEffect(() => {
    loadTeamMembers();
  }, [filters]);

  return {
    teamMembers,
    loading,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getTeamMemberById,
    getProjectStats,
    getSkillsCount,
    refetch: loadTeamMembers
  };
}