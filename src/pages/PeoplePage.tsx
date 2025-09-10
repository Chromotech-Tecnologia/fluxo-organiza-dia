
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PersonModal } from "@/components/modals/PersonModal";
import { TeamMemberModal } from "@/components/modals/TeamMemberModal";
import { PersonCard } from "@/components/people/PersonCard";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { PeopleFilters } from "@/components/people/PeopleFilters";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { usePeopleSearch } from "@/hooks/usePeopleSearch";
import { Plus, User, Users, Search } from "lucide-react";
import { Person, TeamMember } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function PeoplePage() {
  const { people, deletePerson, refetch: refetchPeople } = useSupabasePeople();
  const { teamMembers, deleteTeamMember, refetch: refetchTeamMembers } = useSupabaseTeamMembers();
  const { openPersonModal, openTeamMemberModal, openDeleteModal } = useModalStore();
  const { toast } = useToast();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredPeople,
    filteredTeamMembers,
    totalResults
  } = usePeopleSearch(people, teamMembers);

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
            <h1 className="text-3xl font-bold text-foreground">Pessoas e Equipe</h1>
            <p className="text-muted-foreground">
              Gerencie pessoas e membros da equipe da sua organização
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => openTeamMemberModal()}>
              <Plus className="h-4 w-4" />
              Novo Membro
            </Button>
            <Button className="gap-2" onClick={() => openPersonModal()}>
              <Plus className="h-4 w-4" />
              Nova Pessoa
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <PeopleFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Resultados */}
        {searchQuery && (
          <div className="mt-4 text-sm text-muted-foreground">
            <Search className="inline h-4 w-4 mr-1" />
            {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Pessoas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Pessoas ({filteredPeople.length})
          </h2>
        </div>

        {filteredPeople.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? "Nenhuma pessoa encontrada" : "Nenhuma pessoa cadastrada"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Tente ajustar os filtros ou busca" : "Comece adicionando a primeira pessoa da sua organização"}
                </p>
                {!searchQuery && (
                  <Button className="gap-2" onClick={() => openPersonModal()}>
                    <Plus className="h-4 w-4" />
                    Adicionar Primeira Pessoa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
              />
            ))}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <PersonModal />
      <TeamMemberModal />
      <DeleteModal />
    </div>
  );
}
