import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserTaskStats {
  userId: string;
  totalTasks: number;
  tasksLast7Days: number;
}

export function useUserTaskStats() {
  return useQuery({
    queryKey: ['user-task-stats'],
    queryFn: async (): Promise<UserTaskStats[]> => {
      // Usar a função RPC que tem SECURITY DEFINER para acessar tarefas de todos os usuários
      const { data, error } = await supabase.rpc('get_user_task_counts');

      if (error) {
        console.error('Error fetching user task stats:', error);
        throw error;
      }

      // Converter dados da função RPC para o formato esperado
      return (data || []).map((row: { user_id: string; total_tasks: number; tasks_last_7_days: number }) => ({
        userId: row.user_id,
        totalTasks: row.total_tasks,
        tasksLast7Days: row.tasks_last_7_days,
      }));
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
