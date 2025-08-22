

import { supabase } from '@/integrations/supabase/client';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { CompletionRecord } from '@/types';

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
      // Properly type cast the completion_history from Json to CompletionRecord array
      let completionHistory = (task.completion_history as unknown as CompletionRecord[]) || [];

      // LÓGICA MAIS RIGOROSA: filtrar completion_history para manter apenas entradas válidas
      // Uma entrada é válida se:
      // 1. A data da completion é igual à data agendada da tarefa, OU
      // 2. A data da completion é hoje E a tarefa está agendada para hoje
      const filteredHistory = completionHistory.filter((completion: CompletionRecord) => {
        // Manter apenas se a data da completion corresponde exatamente à data agendada
        // ou se é uma completion de hoje para uma tarefa de hoje
        const isValidCompletion = 
          completion.date === task.scheduled_date || 
          (completion.date === today && task.scheduled_date === today);
        
        console.log(`Tarefa ${task.title}: completion ${completion.date} vs scheduled ${task.scheduled_date} - válida: ${isValidCompletion}`);
        
        return isValidCompletion;
      });

      if (filteredHistory.length !== completionHistory.length) {
        console.log(`Limpando tarefa ${task.title}: ${completionHistory.length} -> ${filteredHistory.length} entradas`);
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

