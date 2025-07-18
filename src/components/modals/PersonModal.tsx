import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { PersonForm } from "@/components/people/PersonForm";
import { usePeople } from "@/hooks/usePeople";
import { PersonFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function PersonModal() {
  const { isPersonModalOpen, personToEdit, closePersonModal } = useModalStore();
  const { addPerson, updatePerson } = usePeople();
  const { toast } = useToast();

  const handleSubmit = async (data: PersonFormValues) => {
    try {
      if (personToEdit) {
        await updatePerson(personToEdit.id, data);
        toast({
          title: "Pessoa atualizada",
          description: "Os dados da pessoa foram atualizados com sucesso.",
        });
      } else {
        await addPerson(data);
        toast({
          title: "Pessoa criada",
          description: "A nova pessoa foi adicionada com sucesso.",
        });
      }
      closePersonModal();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados da pessoa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isPersonModalOpen} onOpenChange={(open) => !open && closePersonModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {personToEdit ? "Editar Pessoa" : "Nova Pessoa"}
          </DialogTitle>
        </DialogHeader>
        <PersonForm
          person={personToEdit}
          onSubmit={handleSubmit}
          onCancel={closePersonModal}
        />
      </DialogContent>
    </Dialog>
  );
}