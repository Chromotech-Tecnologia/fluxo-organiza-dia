import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, BarChart3, Users } from "lucide-react";
import { TaskFiltersImproved } from "@/components/tasks/TaskFiltersImproved";
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { TaskStatsImproved } from "@/components/tasks/TaskStatsImproved";
import { TaskModal } from "@/components/modals/TaskModal";
import { ForwardTaskModal } from "@/components/modals/ForwardTaskModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { Task, TaskFilter, Person, TaskStatus, SortOption } from "@/types";
import { sortTasks, calculateTotalEstimatedTime, formatTime, isTaskRescheduledToday } from "@/lib/taskUtils";
import { useModalStore } from "@/stores/useModalStore";
import { filterTasks } from "@/lib/searchUtils";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { toast } from "sonner";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<TaskFilter>({
    dateRange: {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const { tasks, loading, addTask, updateTask, deleteTask } = useSupabaseTasks();
  const { people } = useSupabasePeople();
  const { openTaskModal, closeTaskModal, isTaskModalOpen, taskToEdit, openForwardTaskModal } = useModalStore();
  const [selectedTab, setSelectedTab] = useState("today");

  // Filtra as tasks com base na data selecionada
  const filteredTasksByDate = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter(task => {
      if (!currentFilters.dateRange) return true;

      const taskDate = task.scheduledDate;
      const startDate = currentFilters.dateRange.start;
      const endDate = currentFilters.dateRange.end;

      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, currentFilters.dateRange]);

  // Filtra as tasks com base nos outros filtros e na busca
  const filteredTasks = useMemo(() => {
    let filtered = filteredTasksByDate;

    // Aplica os filtros
    if (currentFilters) {
      if (currentFilters.type) {
        filtered = filtered.filter(task => currentFilters.type?.includes(task.type));
      }
      if (currentFilters.priority) {
        filtered = filtered.filter(task => currentFilters.priority?.includes(task.priority));
      }
      if (currentFilters.status) {
        filtered = filtered.filter(task => currentFilters.status?.includes(task.status));
      }
      if (currentFilters.assignedPersonId) {
        filtered = filtered.filter(task => task.assignedPersonId === currentFilters.assignedPersonId);
      }
      if (currentFilters.timeInvestment) {
        filtered = filtered.filter(task => currentFilters.timeInvestment?.includes(task.timeInvestment));
      }
      if (currentFilters.category) {
        filtered = filtered.filter(task => currentFilters.category?.includes(task.category));
      }
      if (currentFilters.hasChecklist === true) {
        filtered = filtered.filter(task => task.subItems && task.subItems.length > 0);
      }
      if (currentFilters.isForwarded === true) {
        filtered = filtered.filter(task => task.isForwarded === true);
      }
      if (currentFilters.isForwarded === false) {
        filtered = filtered.filter(task => task.isForwarded === false);
      }
      if (currentFilters.noOrder === true) {
        filtered = filtered.filter(task => !task.order);
      }
    }

    // Aplica a busca
    if (searchQuery) {
      filtered = filterTasks(filtered, searchQuery);
    }

    return filtered;
  }, [filteredTasksByDate, searchQuery, currentFilters]);

  // Ordena as tasks
  const sortedTasks = useMemo(() => {
    if (!filteredTasks) return [];
    return sortTasks(filteredTasks, sortBy);
  }, [filteredTasks, sortBy]);

  // Calcula as estatísticas das tasks
  const taskStats = useMemo(() => {
    if (!tasks) return null;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const overdueTasks = tasks.filter(task => task.status === 'not-done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageForwards = totalTasks > 0 ? tasks.reduce((acc, task) => acc + task.forwardCount, 0) / totalTasks : 0;

    // Encontrar a pessoa com mais tasks atribuídas
    const personTaskCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      if (task.assignedPersonId) {
        personTaskCounts[task.assignedPersonId] = (personTaskCounts[task.assignedPersonId] || 0) + 1;
      }
    });

    let topPersonByTasks: Person | undefined;
    let maxTasks = 0;
    Object.keys(personTaskCounts).forEach(personId => {
      if (personTaskCounts[personId] > maxTasks) {
        maxTasks = personTaskCounts[personId];
        topPersonByTasks = people?.find(person => person.id === personId);
      }
    });

    // Encontrar a task mais forwardada
    let mostForwardedTask: Task | undefined;
    let maxForwards = 0;
    tasks.forEach(task => {
      if (task.forwardCount > maxForwards) {
        maxForwards = task.forwardCount;
        mostForwardedTask = task;
      }
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageForwards,
      topPersonByTasks,
      mostForwardedTask
    };
  }, [tasks, people]);

  // Calcula o tempo estimado total das tasks filtradas
  const totalEstimatedTime = useMemo(() => {
    return calculateTotalEstimatedTime(filteredTasks);
  }, [filteredTasks]);

  // Handlers
  const handleOpenTaskModal = (task?: Task) => {
    openTaskModal(task);
  };

  const handleOpenForwardModal = (task: Task) => {
    openForwardTaskModal(task);
  };

  const handleTaskUpdate = async (taskId: string, newData: Partial<Task>) => {
    try {
      await updateTask(taskId, newData);
      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar a tarefa:", error);
      toast.error('Erro ao atualizar a tarefa.');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir a tarefa:", error);
      toast.error('Erro ao excluir a tarefa.');
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (status === 'completed') {
        // Verifica se a tarefa já foi concluída hoje
        const alreadyCompletedToday = task.completionHistory?.some(record => {
          const recordDate = new Date(record.completedAt).toISOString().split('T')[0];
          const today = getCurrentDateInSaoPaulo();
          return recordDate === today && record.status === 'completed';
        });

        if (alreadyCompletedToday) {
          toast('Esta tarefa já foi concluída hoje!');
          return;
        }

        // Se não foi concluída hoje, prossegue com a conclusão
        const updatedData = {
          status: 'completed' as TaskStatus,
          isConcluded: true,
          concludedAt: new Date().toISOString(),
          completionHistory: [
            ...(task.completionHistory || []),
            {
              completedAt: new Date().toISOString(),
              status: 'completed' as const,
              date: getCurrentDateInSaoPaulo(),
              wasForwarded: task.isForwarded || false
            }
          ]
        };
        await updateTask(taskId, updatedData);
        toast.success('Tarefa marcada como concluída!');
      } else if (status === 'not-done') {
        // Verifica se a tarefa já foi marcada como não feita hoje
        const alreadyMarkedNotDoneToday = task.completionHistory?.some(record => {
          const recordDate = new Date(record.completedAt).toISOString().split('T')[0];
          const today = getCurrentDateInSaoPaulo();
          return recordDate === today && record.status === 'not-done';
        });

        if (alreadyMarkedNotDoneToday) {
          toast('Esta tarefa já foi marcada como não feita hoje!');
          return;
        }

        // Se não foi marcada como não feita hoje, prossegue com a ação
        const updatedData = {
          status: 'not-done' as TaskStatus,
          isConcluded: false,
          concludedAt: null,
          completionHistory: [
            ...(task.completionHistory || []),
            {
              completedAt: new Date().toISOString(),
              status: 'not-done' as const,
              date: getCurrentDateInSaoPaulo(),
              wasForwarded: task.isForwarded || false
            }
          ]
        };
        await updateTask(taskId, updatedData);
        toast.success('Tarefa marcada como não feita!');
      } else {
        await updateTask(taskId, { status });
        toast.success('Status da tarefa atualizado!');
      }
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast.error('Erro ao atualizar status da tarefa.');
    }
  };

  const handleConclude = async (task: Task) => {
    try {
      const updatedData = {
        isConcluded: true,
        concludedAt: new Date().toISOString(),
        status: 'completed' as TaskStatus
      };
      await updateTask(task.id, updatedData);
      toast.success('Tarefa concluída!');
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      toast.error('Erro ao concluir tarefa.');
    }
  };

  const handleUnconclude = async (task: Task) => {
    try {
      const updatedData = {
        isConcluded: false,
        concludedAt: null,
        status: 'pending' as TaskStatus
      };
      await updateTask(task.id, updatedData);
      toast.success('Conclusão da tarefa desfeita!');
    } catch (error) {
      console.error("Erro ao desfazer conclusão da tarefa:", error);
      toast.error('Erro ao desfazer conclusão da tarefa.');
    }
  };

  // Tasks para hoje
  const tasksForToday = useMemo(() => {
    return sortedTasks?.filter(task => task.scheduledDate === getCurrentDateInSaoPaulo());
  }, [sortedTasks]);

  // Tasks pendentes
  const pendingTasks = useMemo(() => {
    return sortedTasks?.filter(task => task.status === 'pending');
  }, [sortedTasks]);

  // Tasks concluídas
  const completedTasks = useMemo(() => {
    return sortedTasks?.filter(task => task.status === 'completed');
  }, [sortedTasks]);

  // Tasks não feitas
  const notDoneTasks = useMemo(() => {
    return sortedTasks?.filter(task => task.status === 'not-done');
  }, [sortedTasks]);

  // Tasks reagendadas para hoje pelo usuário
  const rescheduledTasksToday = useMemo(() => {
    return sortedTasks?.filter(task => isTaskRescheduledToday(task));
  }, [sortedTasks]);

  useEffect(() => {
    if (loading) {
      console.log("Carregando tasks...");
    }
  }, [loading]);

  if (loading) {
    return <div>Carregando tasks...</div>;
  }

  return (
    <div className="container py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Button onClick={() => handleOpenTaskModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFiltersHorizontal
        currentFilters={currentFilters}
        onFiltersChange={setCurrentFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <Tabs defaultValue="today" className="mt-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="today">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hoje
          </TabsTrigger>
          <TabsTrigger value="pending">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Concluídas
          </TabsTrigger>
           <TabsTrigger value="not-done">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Não Feitas
          </TabsTrigger>
          <TabsTrigger value="rescheduled">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Reagendadas
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Equipe
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksForToday?.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onConclude={() => handleConclude(task)}
                onUnconclude={() => handleUnconclude(task)}
                onForward={() => handleOpenForwardModal(task)}
                onEdit={() => handleOpenTaskModal(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks?.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onConclude={() => handleConclude(task)}
                onUnconclude={() => handleUnconclude(task)}
                onForward={() => handleOpenForwardModal(task)}
                onEdit={() => handleOpenTaskModal(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks?.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onConclude={() => handleConclude(task)}
                onUnconclude={() => handleUnconclude(task)}
                onForward={() => handleOpenForwardModal(task)}
                onEdit={() => handleOpenTaskModal(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="not-done" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notDoneTasks?.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onConclude={() => handleConclude(task)}
                onUnconclude={() => handleUnconclude(task)}
                onForward={() => handleOpenForwardModal(task)}
                onEdit={() => handleOpenTaskModal(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rescheduled" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rescheduledTasksToday?.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
                onConclude={() => handleConclude(task)}
                onUnconclude={() => handleUnconclude(task)}
                onForward={() => handleOpenForwardModal(task)}
                onEdit={() => handleOpenTaskModal(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          {taskStats && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Estatísticas Gerais</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{taskStats.totalTasks}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{taskStats.completedTasks}</div>
                      <div className="text-sm text-muted-foreground">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{taskStats.pendingTasks}</div>
                      <div className="text-sm text-muted-foreground">Pendentes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{taskStats.overdueTasks}</div>
                      <div className="text-sm text-muted-foreground">Não Feitas</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{taskStats.completionRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <p>Gerenciar membros da equipe e suas atribuições.</p>
        </TabsContent>
      </Tabs>

      <TaskModal />
      <ForwardTaskModal />
      <RescheduleModal />
    </div>
  );
}
