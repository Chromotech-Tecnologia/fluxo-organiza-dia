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
      // Get date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all users' total tasks
      const { data: totalTasks, error: totalError } = await supabase
        .from('tasks')
        .select('user_id')
        .then(({ data, error }) => {
          if (error) throw error;
          // Group by user_id and count
          const tasksByUser = data?.reduce((acc, task) => {
            acc[task.user_id] = (acc[task.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
          
          return { data: tasksByUser, error: null };
        });

      if (totalError) throw totalError;

      // Get tasks from last 7 days
      const { data: recentTasks, error: recentError } = await supabase
        .from('tasks')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString())
        .then(({ data, error }) => {
          if (error) throw error;
          // Group by user_id and count
          const tasksByUser = data?.reduce((acc, task) => {
            acc[task.user_id] = (acc[task.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
          
          return { data: tasksByUser, error: null };
        });

      if (recentError) throw recentError;

      // Combine results
      const allUserIds = new Set([
        ...Object.keys(totalTasks || {}),
        ...Object.keys(recentTasks || {})
      ]);

      return Array.from(allUserIds).map(userId => ({
        userId,
        totalTasks: totalTasks?.[userId] || 0,
        tasksLast7Days: recentTasks?.[userId] || 0,
      }));
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}