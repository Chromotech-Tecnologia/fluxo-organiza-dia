import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminTasks } from '@/hooks/useAdminTasks';
import { TaskCardImproved } from '@/components/tasks/TaskCardImproved';
import { TaskStatsCompact } from '@/components/tasks/TaskStatsCompact';
import { TaskFiltersHorizontal } from '@/components/tasks/TaskFiltersHorizontal';
import { BulkActionsBar } from '@/components/tasks/BulkActionsBar';
import { TaskHistoryModal } from '@/components/tasks/TaskHistoryModal';
import { RescheduleModal } from '@/components/modals/RescheduleModal';
import { TaskModal } from '@/components/modals/TaskModal';
import { useModalStore } from '@/stores/useModalStore';
import { Task, TaskFilter, SortOption } from '@/types';
import { Users, Eye, FileText, Plus } from 'lucide-react';
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { searchInTask } from "@/lib/searchUtils";
import { sortTasks } from "@/lib/taskUtils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

export function UserDataViewer() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [taskForHistory, setTaskForHistory] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [taskFilters, setTaskFilters] = useState<TaskFilter>({
    dateRange: {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });
  
  const { openTaskModal, openForwardTaskModal, openDeleteModal } = useModalStore();
  const queryClient = useQueryClient();
  
  // Carrega tarefas do usuário selecionado com filtros
  const { tasks: userTasks, updateTask, deleteTask, reorderTasks, concludeTask } = useAdminTasks({
    userId: selectedUserId || undefined,
    filters: taskFilters
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, created_at')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para forçar atualização de dados
  const refreshData = async () => {
    try {
      await queryClient.invalidateQueries({ 
        queryKey: ['admin-tasks', selectedUserId],
        refetchType: 'all'
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const selectedUser = users.find(user => user.id === selectedUserId);

  const filteredTasks = userTasks.filter(task => searchInTask(task, searchQuery));
  const sortedTasks = sortTasks(filteredTasks, sortBy);

  const isMultipleDays = taskFilters.dateRange?.start !== taskFilters.dateRange?.end;
  const hasFiltersApplied = Object.keys(taskFilters).some(key => {
    if (key === 'dateRange') return false; // Sempre temos dateRange
    return taskFilters[key as keyof TaskFilter] !== undefined;
  }) || searchQuery.trim() !== "";

  const displayTasks = isMultipleDays 
    ? filteredTasks.sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }
        return (a.order || 0) - (b.order || 0);
      })
    : sortedTasks;

  const maxOrder = Math.max(...userTasks.map(t => t.order || 0), 1);

  const handleTaskSelection = (task: Task, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, task]);
    } else {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(displayTasks);
    } else {
      setSelectedTasks([]);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      console.log('Alterando status da tarefa:', taskId, 'para:', status);
      
      const task = userTasks.find(t => t.id === taskId);
      if (!task) return;

      if (status === 'pending') {
        const newHistory = task.completionHistory?.slice(0, -1) || [];
        await updateTask(taskId, { 
          status: 'pending',
          completionHistory: newHistory,
          updatedAt: new Date().toISOString()
        });
        await refreshData();
        return;
      }

      const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
      const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
      
      if (hasCompletion && lastCompletion?.status === status) {
        return;
      }

      const completionRecord = {
        completedAt: getCurrentDateInSaoPaulo(),
        status: status as 'completed' | 'not-done',
        date: task.scheduledDate,
        wasForwarded: task.forwardHistory && task.forwardHistory.length > 0
      };

      const updatedCompletionHistory = [
        ...(task.completionHistory || []),
        completionRecord
      ];

      await updateTask(taskId, { 
        status,
        completionHistory: updatedCompletionHistory,
        updatedAt: new Date().toISOString()
      });
      
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const handleForwardTask = (task: Task) => {
    openForwardTaskModal(task);
  };

  const handleEditTask = (task: Task) => {
    openTaskModal(task);
  };

  const handleDeleteTask = (task: Task) => {
    openDeleteModal('task', task);
  };

  const handleTaskHistory = (task: Task) => {
    setTaskForHistory(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isMultipleDays || sortBy !== 'order' || hasFiltersApplied) {
      console.log('Drag and drop desabilitado:', { isMultipleDays, sortBy, hasFiltersApplied });
      return;
    }

    const { active, over } = event;
    if (!active.id || !over?.id || active.id === over.id) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeTask = displayTasks.find(task => task.id === activeTaskId);
    const overTask = displayTasks.find(task => task.id === overTaskId);
    
    if (!activeTask || !overTask) return;

    if (activeTask.scheduledDate !== overTask.scheduledDate) return;

    const tasksForSameDate = displayTasks.filter(task => task.scheduledDate === activeTask.scheduledDate);
    const activeIndex = tasksForSameDate.findIndex(task => task.id === activeTaskId);
    const overIndex = tasksForSameDate.findIndex(task => task.id === overTaskId);
    
    if (activeIndex === -1 || overIndex === -1) return;

    const reorderedTasks = arrayMove(tasksForSameDate, activeIndex, overIndex);
    
    const taskUpdates = reorderedTasks.map((task, index) => ({
      id: task.id,
      newOrder: index + 1
    }));

    for (const update of taskUpdates) {
      await updateTask(update.id, { order: update.newOrder });
    }

    await refreshData();
  };

  const handleConcludeTask = async (taskId: string) => {
    console.log('Concluindo tarefa:', taskId);
    await concludeTask(taskId);
    await refreshData();
  };

  const handleUnconcludeTask = async (taskId: string) => {
    try {
      console.log('Desfazendo conclusão da tarefa:', taskId);
      
      const task = userTasks.find(t => t.id === taskId);
      if (!task) return;

      await updateTask(taskId, {
        ...task,
        isConcluded: false,
        status: 'pending',
        updatedAt: new Date().toISOString()
      });
      await refreshData();
    } catch (error) {
      console.error('Erro ao desfazer conclusão da tarefa:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dados dos Usuários</h2>
          <p className="text-muted-foreground">Visualize informações e tarefas dos usuários</p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuário Selecionado</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{selectedUser ? selectedUser.name || 'Sem nome' : 'Nenhum'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas do Usuário</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Usuário</CardTitle>
          <CardDescription>
            Escolha um usuário para visualizar suas informações e tarefas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || 'Sem nome'} - {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <div className="text-sm">{selectedUser.name || 'Não informado'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="text-sm">{selectedUser.email || 'Não informado'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID do Usuário</label>
                <div className="text-sm font-mono text-xs">{selectedUser.id}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                <div className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUserId && (
        <>
          <TaskFiltersHorizontal 
            currentFilters={taskFilters}
            onFiltersChange={setTaskFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <TaskStatsCompact tasks={displayTasks} />

          <Card>
            <CardHeader>
              <CardTitle>Tarefas do Usuário</CardTitle>
              <CardDescription>
                {displayTasks.length === 0 ? 'Nenhuma tarefa encontrada' : `${displayTasks.length} tarefas encontradas`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa cadastrada"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Tente ajustar sua busca ou criar uma nova tarefa"
                      : "Comece criando sua primeira tarefa para organizar seu dia"
                    }
                  </p>
                  <Button className="gap-2" onClick={() => openTaskModal()}>
                    <Plus className="h-4 w-4" />
                    {searchQuery ? "Nova Tarefa" : "Criar Primeira Tarefa"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-1 mb-4">
                    <Checkbox
                      checked={selectedTasks.length === displayTasks.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <label className="text-sm text-muted-foreground">
                      Selecionar todas ({displayTasks.length} tarefas)
                      {hasFiltersApplied && (
                        <span className="text-orange-600 ml-2">
                          ⚠️ Drag & Drop desabilitado (filtros ativos)
                        </span>
                      )}
                    </label>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext items={displayTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                      {displayTasks.map((task, index) => (
                        <div key={task.id} className="flex items-start gap-3 mb-4">
                          <Checkbox
                            checked={selectedTasks.some(t => t.id === task.id)}
                            onCheckedChange={(checked) => handleTaskSelection(task, checked as boolean)}
                            className="mt-4"
                          />
                          <div className="flex-1">
                            <TaskCardImproved 
                              task={task} 
                              taskIndex={isMultipleDays ? undefined : index}
                              maxOrder={maxOrder}
                              onStatusChange={(status) => handleStatusChange(task.id, status)}
                              onConclude={() => handleConcludeTask(task.id)}
                              onUnconclude={() => handleUnconcludeTask(task.id)}
                              onForward={() => handleForwardTask(task)}
                              onEdit={() => handleEditTask(task)}
                              onDelete={() => handleDeleteTask(task)}
                              onHistory={() => handleTaskHistory(task)}
                              currentViewDate={taskFilters.dateRange?.start}
                            />
                          </div>
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  <BulkActionsBar 
                    selectedTasks={selectedTasks}
                    onClearSelection={() => setSelectedTasks([])}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <TaskHistoryModal
        task={taskForHistory}
        isOpen={!!taskForHistory}
        onClose={() => setTaskForHistory(null)}
      />
      <RescheduleModal onRescheduleComplete={refreshData} />
      <TaskModal onTaskSaved={refreshData} />
    </div>
  );
}