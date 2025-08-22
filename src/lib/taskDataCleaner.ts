
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';

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
      let completionHistory = task.completion_history || [];

      // Filtrar completion_history para remover entradas inconsistentes
      const filteredHistory = completionHistory.filter((completion: any) => {
        // Manter apenas se a data da completion for igual à data agendada da tarefa
        // ou se for hoje e a tarefa está agendada para hoje ou antes
        return completion.date === task.scheduled_date || 
               (completion.date === today && task.scheduled_date <= today);
      });

      if (filteredHistory.length !== completionHistory.length) {
        needsUpdate = true;
        completionHistory = filteredHistory;
      }

      if (needsUpdate) {
        tasksToUpdate.push({
          id: task.id,
          completion_history: completionHistory
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
