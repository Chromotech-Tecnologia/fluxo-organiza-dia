import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { TeamMemberFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function TeamMemberModal() {
  const { isTeamMemberModalOpen, teamMemberToEdit, closeTeamMemberModal } = useModalStore();
  const { addTeamMember, updateTeamMember, refetch } = useSupabaseTeamMembers();
  const { toast } = useToast();

  const handleSubmit = async (data: TeamMemberFormValues) => {
    try {
      if (teamMemberToEdit) {
        await updateTeamMember(teamMemberToEdit.id, data);
        toast({
          title: "Membro da equipe atualizado",
          description: "Os dados do membro foram atualizados com sucesso.",
        });
      } else {
        await addTeamMember(data);
        toast({
          title: "Membro da equipe criado",
          description: "O novo membro foi adicionado com sucesso.",
        });
      }
      closeTeamMemberModal();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados do membro.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isTeamMemberModalOpen} onOpenChange={(open) => !open && closeTeamMemberModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teamMemberToEdit ? "Editar Membro da Equipe" : "Novo Membro da Equipe"}
          </DialogTitle>
        </DialogHeader>
        <TeamMemberForm
          teamMember={teamMemberToEdit}
          onSubmit={handleSubmit}
          onCancel={closeTeamMemberModal}
        />
      </DialogContent>
    </Dialog>
  );
}