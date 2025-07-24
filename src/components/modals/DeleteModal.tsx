import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useModalStore } from "@/stores/useModalStore";
import { useTasks } from "@/hooks/useTasks";
import { usePeople } from "@/hooks/usePeople";
import { useSkills } from "@/hooks/useSkills";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useToast } from "@/hooks/use-toast";

export function DeleteModal() {
  const { 
    isDeleteModalOpen, 
    deleteType, 
    itemToDelete, 
    closeDeleteModal 
  } = useModalStore();
  const { deleteTask, refetch: refetchTasks } = useTasks();
  const { deletePerson, refetch: refetchPeople } = usePeople();
  const { deleteSkill, refetch: refetchSkills } = useSkills();
  const { deleteTeamMember, refetch: refetchTeamMembers } = useTeamMembers();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      if (deleteType === 'task') {
        await deleteTask(itemToDelete.id);
        setTimeout(() => refetchTasks(), 100);
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi excluída com sucesso.",
        });
      } else if (deleteType === 'person') {
        await deletePerson(itemToDelete.id);
        setTimeout(() => refetchPeople(), 100);
        toast({
          title: "Pessoa excluída",
          description: "A pessoa foi excluída com sucesso.",
        });
      } else if (deleteType === 'skill') {
        await deleteSkill(itemToDelete.id);
        setTimeout(() => refetchSkills(), 100);
        toast({
          title: "Habilidade excluída",
          description: "A habilidade foi excluída com sucesso.",
        });
      } else if (deleteType === 'teamMember') {
        await deleteTeamMember(itemToDelete.id);
        setTimeout(() => refetchTeamMembers(), 100);
        toast({
          title: "Membro da equipe excluído",
          description: "O membro da equipe foi excluído com sucesso.",
        });
      }
      closeDeleteModal();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o item.",
        variant: "destructive",
      });
    }
  };

  const getTitle = () => {
    if (deleteType === 'task') return "Excluir Tarefa";
    if (deleteType === 'person') return "Excluir Pessoa";
    if (deleteType === 'skill') return "Excluir Habilidade";
    if (deleteType === 'teamMember') return "Excluir Membro da Equipe";
    return "Excluir Item";
  };

  const getDescription = () => {
    if (deleteType === 'task') {
      return "Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.";
    }
    if (deleteType === 'person') {
      return "Tem certeza que deseja excluir esta pessoa? Todas as tarefas associadas serão desvinculadas. Esta ação não pode ser desfeita.";
    }
    if (deleteType === 'skill') {
      return "Tem certeza que deseja excluir esta habilidade? Esta ação não pode ser desfeita.";
    }
    if (deleteType === 'teamMember') {
      return "Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita.";
    }
    return "Tem certeza que deseja excluir este item?";
  };

  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}