
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { TeamMemberModal } from "@/components/modals/TeamMemberModal";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { PeopleFilters } from "@/components/people/PeopleFilters";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { Plus, Users, Search } from "lucide-react";
import { TeamMember } from "@/types";
import { useState } from "react";

export default function PeoplePage() {
  const { teamMembers, deleteTeamMember, refetch: refetchTeamMembers } = useSupabaseTeamMembers();
  const { openTeamMemberModal, openDeleteModal } = useModalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    status?: string;
    skill?: string;
    projectStatus?: string;
    projectName?: string;
  }>({});

  // Filtrar team members baseado na busca e filtros
  const filteredTeamMembers = teamMembers.filter(member => {
    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        member.name.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Filtro por status
    if (filters.status && member.status !== filters.status) {
      return false;
    }

    // Filtro por habilidade
    if (filters.skill && (!member.skillIds || !member.skillIds.includes(filters.skill))) {
      return false;
    }

    // Filtro por status do projeto
    if (filters.projectStatus) {
      const hasMatchingProjectStatus = member.projects?.some((project: any) => 
        project.status === filters.projectStatus
      );
      if (!hasMatchingProjectStatus) return false;
    }

    // Filtro por nome do projeto
    if (filters.projectName) {
      const hasMatchingProjectName = member.projects?.some((project: any) => 
        project.name === filters.projectName
      );
      if (!hasMatchingProjectName) return false;
    }

    return true;
  });

  const handleEditTeamMember = (teamMember: TeamMember) => {
    openTeamMemberModal(teamMember);
  };

  const handleDeleteTeamMember = (teamMember: TeamMember) => {
    openDeleteModal('teamMember', teamMember);
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
            <p className="text-muted-foreground">
              Gerencie os membros da sua equipe
            </p>
          </div>
          <Button className="gap-2" onClick={() => openTeamMemberModal()}>
            <Plus className="h-4 w-4" />
            Novo Membro da Equipe
          </Button>
        </div>

        {/* Filtros */}
        <PeopleFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          teamMembers={teamMembers}
        />

        {/* Resultados */}
        {searchQuery && (
          <div className="mt-4 text-sm text-muted-foreground">
            <Search className="inline h-4 w-4 mr-1" />
            {filteredTeamMembers.length} resultado{filteredTeamMembers.length !== 1 ? 's' : ''} encontrado{filteredTeamMembers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Membros da Equipe */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Membros da Equipe ({filteredTeamMembers.length})
          </h2>
        </div>

        {filteredTeamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? "Nenhum membro encontrado" : "Nenhum membro da equipe cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Tente ajustar os filtros ou busca" : "Comece adicionando o primeiro membro da sua equipe"}
                </p>
                {!searchQuery && (
                  <Button className="gap-2" onClick={() => openTeamMemberModal()}>
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Membro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {filteredTeamMembers.map((teamMember) => (
              <TeamMemberCard 
                key={teamMember.id} 
                teamMember={teamMember}
                onEdit={() => handleEditTeamMember(teamMember)}
                onDelete={() => handleDeleteTeamMember(teamMember)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <TeamMemberModal />
      <DeleteModal />
    </div>
  );
}
