
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { CompletionRecord, ForwardRecord } from '@/types';

export async function cleanInconsistentTaskData() {
  try {
    const today = getCurrentDateInSaoPaulo();
    
    // Buscar todas as tarefas
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) throw error;

    const tasksToUpdate = [];

    for (const task of tasks || []) {
      let needsUpdate = false;
      let completionHistory = (task.completion_history as unknown as CompletionRecord[]) || [];
      const forwardHistory = (task.forward_history as unknown as ForwardRecord[]) || [];

      // Verificar cada completion para corrigir o wasForwarded
      const correctedHistory = completionHistory.map((completion: CompletionRecord) => {
        // Verificar se existe um forward_history correspondente onde a tarefa foi reagendada
        // DA data da completion para outra data
        const wasActuallyForwarded = forwardHistory.some((forward: ForwardRecord) => 
          forward.originalDate === completion.date
        );

        // Se o wasForwarded está incorreto, corrigir
        if (completion.wasForwarded !== wasActuallyForwarded) {
          console.log(`Corrigindo tarefa "${task.title}": completion em ${completion.date} - wasForwarded: ${completion.wasForwarded} -> ${wasActuallyForwarded}`);
          needsUpdate = true;
          return {
            ...completion,
            wasForwarded: wasActuallyForwarded
          };
        }

        return completion;
      });

      // Filtrar completion_history para manter apenas entradas válidas
      // Uma entrada é válida se a data da completion é igual à data agendada da tarefa
      const validHistory = correctedHistory.filter((completion: CompletionRecord) => {
        const isValidCompletion = completion.date === task.scheduled_date;
        
        if (!isValidCompletion) {
          console.log(`Removendo completion inválida da tarefa "${task.title}": completion ${completion.date} vs scheduled ${task.scheduled_date}`);
          needsUpdate = true;
        }
        
        return isValidCompletion;
      });

      if (needsUpdate) {
        tasksToUpdate.push({
          id: task.id,
          completion_history: validHistory
        });
      }
    }

    // Atualizar tarefas em lote
    for (const taskUpdate of tasksToUpdate) {
      await supabase
        .from('tasks')
        .update({ completion_history: taskUpdate.completion_history })
        .eq('id', taskUpdate.id);
    }

    console.log(`Limpeza concluída: ${tasksToUpdate.length} tarefas atualizadas`);
    return tasksToUpdate.length;
  } catch (error) {
    console.error('Erro na limpeza dos dados:', error);
    throw error;
  }
}
