import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/stores/useModalStore";
import { SkillForm } from "@/components/skills/SkillForm";
import { useSkills } from "@/hooks/useSkills";
import { SkillFormValues } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function SkillModal() {
  const { isSkillModalOpen, skillToEdit, closeSkillModal } = useModalStore();
  const { addSkill, updateSkill } = useSkills();
  const { toast } = useToast();

  const handleSubmit = async (data: SkillFormValues) => {
    try {
      if (skillToEdit) {
        await updateSkill(skillToEdit.id, data);
        toast({
          title: "Habilidade atualizada",
          description: "A habilidade foi atualizada com sucesso.",
        });
      } else {
        await addSkill(data);
        toast({
          title: "Habilidade criada",
          description: "A nova habilidade foi adicionada com sucesso.",
        });
      }
      closeSkillModal();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a habilidade.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isSkillModalOpen} onOpenChange={(open) => !open && closeSkillModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {skillToEdit ? "Editar Habilidade" : "Nova Habilidade"}
          </DialogTitle>
        </DialogHeader>
        <SkillForm
          skill={skillToEdit}
          onSubmit={handleSubmit}
          onCancel={closeSkillModal}
        />
      </DialogContent>
    </Dialog>
  );
}