
import { useState } from 'react';
import { cleanInconsistentTaskData } from '@/lib/taskDataCleaner';
import { toast } from '@/hooks/use-toast';

export function useTaskDataCleaner() {
  const [isLoading, setIsLoading] = useState(false);

  const cleanData = async () => {
    setIsLoading(true);
    try {
      const updatedCount = await cleanInconsistentTaskData();
      toast({
        title: "Limpeza concluída",
        description: `${updatedCount} tarefas foram corrigidas.`,
      });
      return updatedCount;
    } catch (error) {
      toast({
        title: "Erro na limpeza",
        description: "Erro ao limpar dados inconsistentes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cleanData,
    isLoading
  };
}
