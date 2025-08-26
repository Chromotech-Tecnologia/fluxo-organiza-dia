
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { TaskStatsImproved } from "@/components/tasks/TaskStatsImproved";
import { TaskFiltersImproved } from "@/components/tasks/TaskFiltersImproved";
import { BulkActionsBar } from "@/components/tasks/BulkActionsBar";
import { TaskModal } from "@/components/modals/TaskModal";
import { ForwardTaskModal } from "@/components/modals/ForwardTaskModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { TaskHistoryModal } from "@/components/tasks/TaskHistoryModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useModalStore } from "@/stores/useModalStore";
import { Task, TaskFilter } from "@/types";
import { sortTasks } from "@/lib/taskUtils";
import { Plus, Calendar, CheckCircle, Clock, RotateCcw, BarChart3, Users, X } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

type TaskTab = 'today' | 'pending' | 'completed' | 'not-done' | 'rescheduled' | 'stats' | 'team';

export default function TasksPage() {
  // Hooks
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refetch: refetchTasks
  } = useSupabaseTasks();
  const { openTaskModal, openForwardTaskModal, openDeleteModal } = useModalStore();

  // State - Initialize filters with default values
  const [activeTab, setActiveTab] = useState<TaskTab>('today');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({
    search: '',
    priority: undefined,
    status: undefined,
    category: undefined,
    type: undefined,
    assignedPersonId: undefined,
    dateRange: undefined
  });

  // Handlers
  const handleAddTask = () => {
    openTaskModal();
  };

  const handleEditTask = (task: Task) => {
    openTaskModal(task);
  };

  const handleForwardTask = (task: Task) => {
    openForwardTaskModal(task);
  };

  const handleViewTaskHistory = (task: Task) => {
    // openTaskHistoryModal(task);
  };

  const handleDeleteTask = (task: Task) => {
    openDeleteModal('task', task);
  };

  const handleDeleteTasksBulk = () => {
    // openDeleteModal('tasksBulk', selectedTasks);
  };

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    const visibleTasksIds = getVisibleTasks().map(task => task.id);
    
    if (selectedTasks.length === visibleTasksIds.length) {
      // Deselecionar todos se todos já estiverem selecionados
      setSelectedTasks([]);
    } else {
      // Selecionar todos os visíveis
      setSelectedTasks(visibleTasksIds);
    }
  };

  const handleStatusChange = async (status: Task['status']) => {
    // This function will be called from within TaskCardImproved
    // The task ID is handled internally by the card component
  };

  const handleConclude = async () => {
    // This function will be called from within TaskCardImproved
  };

  const handleUnconclude = async () => {
    // This function will be called from within TaskCardImproved
  };

  const handleBulkStatusUpdate = async (newStatus: Task['status']) => {
    // await updateTasksBulk(selectedTasks, { status: newStatus });
    setSelectedTasks([]); // Limpar seleção após a atualização em massa
  };

  const handleFiltersChange = (newFilters: TaskFilter) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      priority: undefined,
      status: undefined,
      category: undefined,
      type: undefined,
      assignedPersonId: undefined,
      dateRange: undefined
    });
  };

  // Getters
  const getVisibleTasks = () => {
    let filteredTasks = tasks;
    
    // Apply basic filtering
    if (filters.search) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters.priority && filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority!.includes(task.priority));
    }
    
    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }
    
    return sortTasks(filteredTasks, 'date');
  };

  const getTabTasks = (tab: TaskTab) => {
    const today = startOfDay(new Date());

    return getVisibleTasks().filter(task => {
      if (tab === 'today') {
        return isToday(new Date(task.scheduledDate));
      } else if (tab === 'pending') {
        return isBefore(new Date(task.scheduledDate), today) && task.status !== 'completed' && task.status !== 'not-done';
      } else if (tab === 'completed') {
        return task.status === 'completed';
      } else if (tab === 'not-done') {
        return task.status === 'not-done';
      } else if (tab === 'rescheduled') {
        return task.completionHistory && task.completionHistory.length > 0;
      }
      return true;
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.assignedPersonId) count++;
    if (filters.dateRange) {
      if (filters.dateRange.start) count++;
      if (filters.dateRange.end) count++;
    }
    return count;
  };

  // Memoized values
  const visibleTasks = useMemo(() => getVisibleTasks(), [tasks, filters]);
  const activeFiltersCount = useMemo(() => getActiveFiltersCount(), [filters]);
  const todayTasks = useMemo(() => getTabTasks('today'), [tasks, filters]);
  const pendingTasks = useMemo(() => getTabTasks('pending'), [tasks, filters]);
  const completedTasks = useMemo(() => getTabTasks('completed'), [tasks, filters]);
  const notDoneTasks = useMemo(() => getTabTasks('not-done'), [tasks, filters]);
  const rescheduledTasks = useMemo(() => getTabTasks('rescheduled'), [tasks, filters]);
  const allTasksSelected = useMemo(() => selectedTasks.length === visibleTasks.length && visibleTasks.length > 0, [selectedTasks, visibleTasks]);

  // Effects
  useEffect(() => {
    refetchTasks();
  }, []);

  const selectedTaskObjects = tasks.filter(task => selectedTasks.includes(task.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e projetos
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddTask}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <BulkActionsBar
          selectedTasks={selectedTaskObjects}
          onClearSelection={() => setSelectedTasks([])}
        />
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TaskTab)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="today" className="gap-2">
                <Calendar className="h-4 w-4" />
                Hoje <Badge variant="secondary">{todayTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pendentes <Badge variant="secondary">{pendingTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Concluídas <Badge variant="secondary">{completedTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="not-done" className="gap-2">
                <X className="h-4 w-4" />
                Não Feitas <Badge variant="secondary">{notDoneTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rescheduled" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reagendadas <Badge variant="secondary">{rescheduledTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Equipe
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <TaskFiltersImproved
          filters={filters}
          onFiltersChange={handleFiltersChange}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Tasks Content */}
      <TabsContent value="today" className="space-y-4">
        {todayTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa para hoje
                </h3>
                <p className="text-muted-foreground">
                  Aproveite o seu dia!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayTasks.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onConclude={handleConclude}
                onUnconclude={handleUnconclude}
                onEdit={() => handleEditTask(task)}
                onForward={() => handleForwardTask(task)}
                onHistory={() => handleViewTaskHistory(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        {pendingTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa pendente
                </h3>
                <p className="text-muted-foreground">
                  Todas as suas tarefas estão em dia!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onConclude={handleConclude}
                onUnconclude={handleUnconclude}
                onEdit={() => handleEditTask(task)}
                onForward={() => handleForwardTask(task)}
                onHistory={() => handleViewTaskHistory(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {completedTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa concluída
                </h3>
                <p className="text-muted-foreground">
                  Comece a concluir suas tarefas!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onConclude={handleConclude}
                onUnconclude={handleUnconclude}
                onEdit={() => handleEditTask(task)}
                onForward={() => handleForwardTask(task)}
                onHistory={() => handleViewTaskHistory(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="not-done" className="space-y-4">
        {notDoneTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <X className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa não feita
                </h3>
                <p className="text-muted-foreground">
                  Todas as suas tarefas estão sendo realizadas!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notDoneTasks.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onConclude={handleConclude}
                onUnconclude={handleUnconclude}
                onEdit={() => handleEditTask(task)}
                onForward={() => handleForwardTask(task)}
                onHistory={() => handleViewTaskHistory(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="rescheduled" className="space-y-4">
        {rescheduledTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <RotateCcw className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa reagendada
                </h3>
                <p className="text-muted-foreground">
                  Todas as suas tarefas estão dentro do prazo!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rescheduledTasks.map(task => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onConclude={handleConclude}
                onUnconclude={handleUnconclude}
                onEdit={() => handleEditTask(task)}
                onForward={() => handleForwardTask(task)}
                onHistory={() => handleViewTaskHistory(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="stats" className="space-y-4">
        <TaskStatsImproved tasks={visibleTasks} />
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Funcionalidade em desenvolvimento
              </h3>
              <p className="text-muted-foreground">
                Acompanhe o desempenho da sua equipe em breve!
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Modals */}
      <TaskModal />
      <ForwardTaskModal />
      <RescheduleModal />
      <TaskHistoryModal task={null} isOpen={false} onClose={() => {}} />
      <DeleteModal />
    </div>
  );
}
