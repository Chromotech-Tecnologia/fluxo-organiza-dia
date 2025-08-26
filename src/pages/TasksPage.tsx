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
import { TaskHistoryModal } from "@/components/modals/TaskHistoryModal";
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
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useSupabaseTasks();
  const { people } = useSupabasePeople();
  const { openModal } = useModalStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState(false);
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
    setSelectedTask(task || null);
    openModal({ type: 'task', isOpen: true, initialData: task });
  };

  const handleOpenForwardModal = (task: Task) => {
    setSelectedTask(task);
    setIsForwardModalOpen(true);
  };

  const handleCloseForwardModal = () => {
    setIsForwardModalOpen(false);
    setSelectedTask(null);
  };

  const handleOpenRescheduleModal = (task: Task) => {
    setSelectedTask(task);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedTask(null);
  };

  const handleOpenTaskHistoryModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskHistoryModalOpen(true);
  };

  const handleCloseTaskHistoryModal = () => {
    setIsTaskHistoryModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (task: Task, newData: Partial<Task>) => {
    try {
      const updatedTask = { ...task, ...newData };
      await updateTask(updatedTask);
      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar a tarefa:", error);
      toast.error('Erro ao atualizar a tarefa.');
    }
  };

  const handleTaskDelete = async (task: Task) => {
    try {
      await deleteTask(task.id);
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir a tarefa:", error);
      toast.error('Erro ao excluir a tarefa.');
    }
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      // Verifica se a tarefa já foi concluída hoje
      const alreadyCompletedToday = task.completionHistory?.some(record => {
        const recordDate = new Date(record.completedAt).toISOString().split('T')[0];
        const today = getCurrentDateInSaoPaulo();
        return recordDate === today && record.status === 'completed';
      });

      if (alreadyCompletedToday) {
        toast.warning('Esta tarefa já foi concluída hoje!');
        return;
      }

      // Se não foi concluída hoje, prossegue com a conclusão
      const updatedTask = {
        ...task,
        status: 'completed',
        isConcluded: true,
        concludedAt: new Date().toISOString(),
        completionHistory: [
          ...(task.completionHistory || []),
          {
            completedAt: new Date().toISOString(),
            status: 'completed',
            date: getCurrentDateInSaoPaulo(),
            wasForwarded: task.isForwarded || false
          }
        ]
      };
      await updateTask(updatedTask);
      toast.success('Tarefa marcada como concluída!');
    } catch (error) {
      console.error("Erro ao marcar a tarefa como concluída:", error);
      toast.error('Erro ao marcar a tarefa como concluída.');
    }
  };

  const handleTaskNotDone = async (task: Task) => {
    try {
      // Verifica se a tarefa já foi marcada como não feita hoje
      const alreadyMarkedNotDoneToday = task.completionHistory?.some(record => {
        const recordDate = new Date(record.completedAt).toISOString().split('T')[0];
        const today = getCurrentDateInSaoPaulo();
        return recordDate === today && record.status === 'not-done';
      });

      if (alreadyMarkedNotDoneToday) {
        toast.warning('Esta tarefa já foi marcada como não feita hoje!');
        return;
      }

      // Se não foi marcada como não feita hoje, prossegue com a ação
      const updatedTask = {
        ...task,
        status: 'not-done',
        isConcluded: false,
        concludedAt: null,
        completionHistory: [
          ...(task.completionHistory || []),
          {
            completedAt: new Date().toISOString(),
            status: 'not-done',
            date: getCurrentDateInSaoPaulo(),
            wasForwarded: task.isForwarded || false
          }
        ]
      };
      await updateTask(updatedTask);
      toast.success('Tarefa marcada como não feita!');
    } catch (error) {
      console.error("Erro ao marcar a tarefa como não feita:", error);
      toast.error('Erro ao marcar a tarefa como não feita.');
    }
  };

  // Agrupar tarefas por status
  const groupedTasks = useMemo(() => {
    if (!sortedTasks) return {};

    return sortedTasks.reduce((acc: { [key in TaskStatus]?: Task[] }, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status]?.push(task);
      return acc;
    }, {});
  }, [sortedTasks]);

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
    if (error) {
      console.error("Erro ao buscar as tasks:", error);
    }
  }, [error]);

  if (isLoading) {
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
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onNotDone={handleTaskNotDone}
                onForward={handleOpenForwardModal}
                onReschedule={handleOpenRescheduleModal}
                onHistory={handleOpenTaskHistoryModal}
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
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onNotDone={handleTaskNotDone}
                onForward={handleOpenForwardModal}
                onReschedule={handleOpenRescheduleModal}
                onHistory={handleOpenTaskHistoryModal}
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
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onNotDone={handleTaskNotDone}
                onForward={handleOpenForwardModal}
                onReschedule={handleOpenRescheduleModal}
                onHistory={handleOpenTaskHistoryModal}
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
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onNotDone={handleTaskNotDone}
                onForward={handleOpenForwardModal}
                onReschedule={handleOpenRescheduleModal}
                onHistory={handleOpenTaskHistoryModal}
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
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onNotDone={handleTaskNotDone}
                onForward={handleOpenForwardModal}
                onReschedule={handleOpenRescheduleModal}
                onHistory={handleOpenTaskHistoryModal}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <TaskStatsImproved
            totalTasks={taskStats?.totalTasks || 0}
            completedTasks={taskStats?.completedTasks || 0}
            pendingTasks={taskStats?.pendingTasks || 0}
            overdueTasks={taskStats?.overdueTasks || 0}
            completionRate={taskStats?.completionRate || 0}
            averageForwards={taskStats?.averageForwards || 0}
            totalEstimatedTime={totalEstimatedTime}
            topPersonByTasks={taskStats?.topPersonByTasks}
            mostForwardedTask={taskStats?.mostForwardedTask}
          />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <p>Gerenciar membros da equipe e suas atribuições.</p>
        </TabsContent>
      </Tabs>

      <TaskModal
        isOpen={useModalStore.getState().isOpen}
        onClose={() => useModalStore.getState().closeModal()}
        initialData={useModalStore.getState().initialData}
        onSubmit={async (data) => {
          try {
            if (data.id) {
              // Atualizar task existente
              await updateTask(data);
              toast.success('Tarefa atualizada com sucesso!');
            } else {
              // Criar nova task
              await createTask(data);
              toast.success('Tarefa criada com sucesso!');
            }
            useModalStore.getState().closeModal();
          } catch (error) {
            console.error("Erro ao criar/atualizar a tarefa:", error);
            toast.error('Erro ao criar/atualizar a tarefa.');
          }
        }}
      />

      {/* Modais */}
      {selectedTask && (
        <>
          <ForwardTaskModal
            isOpen={isForwardModalOpen}
            onClose={handleCloseForwardModal}
            task={selectedTask}
            onTaskUpdate={handleTaskUpdate}
          />

          <RescheduleModal
            isOpen={isRescheduleModalOpen}
            onClose={handleCloseRescheduleModal}
            task={selectedTask}
            onTaskUpdate={handleTaskUpdate}
          />

          <TaskHistoryModal
            isOpen={isTaskHistoryModalOpen}
            onClose={handleCloseTaskHistoryModal}
            task={selectedTask}
          />
        </>
      )}
    </div>
  );
}
