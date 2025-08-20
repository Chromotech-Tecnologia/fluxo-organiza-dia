import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PersonModal } from "@/components/modals/PersonModal";
import { TeamMemberModal } from "@/components/modals/TeamMemberModal";
import { PersonCard } from "@/components/people/PersonCard";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { Plus, User, Users } from "lucide-react";
import { Person, TeamMember } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function PeoplePage() {
  const { people, deletePerson, refetch: refetchPeople } = useSupabasePeople();
  const { teamMembers, deleteTeamMember, refetch: refetchTeamMembers } = useSupabaseTeamMembers();
  const { openPersonModal, openTeamMemberModal, openDeleteModal } = useModalStore();
  const { toast } = useToast();

  const handleEditPerson = (person: Person) => {
    openPersonModal(person);
  };

  const handleDeletePerson = (person: Person) => {
    openDeleteModal('person', person);
  };

  const handleEditTeamMember = (teamMember: TeamMember) => {
    openTeamMemberModal(teamMember);
  };

  const handleDeleteTeamMember = (teamMember: TeamMember) => {
    openDeleteModal('teamMember', teamMember);
  };

  return (
    <div className="space-y-6">
      {/* Pessoas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pessoas</h2>
            <p className="text-muted-foreground">
              Gerencie as pessoas da sua organização
            </p>
          </div>
          <Button className="gap-2" onClick={() => openPersonModal()}>
            <Plus className="h-4 w-4" />
            Nova Pessoa
          </Button>
        </div>

        {people.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma pessoa cadastrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando a primeira pessoa da sua organização
                </p>
                <Button className="gap-2" onClick={() => openPersonModal()}>
                  <Plus className="h-4 w-4" />
                  Adicionar Primeira Pessoa
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={() => handleEditPerson(person)}
                onDelete={() => handleDeletePerson(person)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Membros da Equipe */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Membros da Equipe</h2>
            <p className="text-muted-foreground">
              Gerencie os membros da sua equipe
            </p>
          </div>
          <Button className="gap-2" onClick={() => openTeamMemberModal()}>
            <Plus className="h-4 w-4" />
            Novo Membro
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum membro da equipe cadastrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando o primeiro membro da sua equipe
                </p>
                <Button className="gap-2" onClick={() => openTeamMemberModal()}>
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((teamMember) => (
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
