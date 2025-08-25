import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { TaskStatsCompact } from "@/components/tasks/TaskStatsCompact";
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { BulkActionsBar } from "@/components/tasks/BulkActionsBar";
import { TaskHistoryModal } from "@/components/tasks/TaskHistoryModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Task, TaskFilter } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { searchInTask } from "@/lib/searchUtils";
import { sortTasks, SortOption } from "@/lib/taskUtils";
import { TaskModal } from "@/components/modals/TaskModal";

const TasksPage = () => {
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
  const { tasks, updateTask, deleteTask, reorderTasks, concludeTask, refetch } = useSupabaseTasks(taskFilters);

  // Função para atualizar dados após qualquer ação com await
  const refreshData = async () => {
    try {
      console.log('Atualizando dados das tarefas...');
      await refetch();
      console.log('Dados das tarefas atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Aplicar busca e ordenação
  const filteredTasks = tasks.filter(task => searchInTask(task, searchQuery));
  const sortedTasks = sortTasks(filteredTasks, sortBy);

  // Para múltiplos dias, mostrar a ordem real sem reordenar
  const isMultipleDays = taskFilters.dateRange?.start !== taskFilters.dateRange?.end;
  const displayTasks = isMultipleDays 
    ? filteredTasks.sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }
        return (a.order || 0) - (b.order || 0);
      })
    : sortedTasks;

  // Calcular ordem máxima para cores
  const maxOrder = Math.max(...tasks.map(t => t.order || 0), 1);

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
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (status === 'pending') {
        const newHistory = task.completionHistory?.slice(0, -1) || [];
        await updateTask(taskId, { 
          status: 'pending',
          completionHistory: newHistory,
          updatedAt: new Date().toISOString()
        });
        await refreshData(); // Aguardar atualização
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
      
      await refreshData(); // Aguardar atualização
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
    if (isMultipleDays || sortBy !== 'order') return;

    const { active, over } = event;
    if (!active.id || !over?.id || active.id === over.id) return;

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    // Encontrar as tarefas
    const activeTask = displayTasks.find(task => task.id === activeTaskId);
    const overTask = displayTasks.find(task => task.id === overTaskId);
    
    if (!activeTask || !overTask) return;

    if (activeTask.scheduledDate !== overTask.scheduledDate) return;

    const activeOrder = activeTask.order || 0;
    const overOrder = overTask.order || 0;

    const allTasksForDate = tasks.filter(task => task.scheduledDate === activeTask.scheduledDate);
    
    const updatedTasks = allTasksForDate.map(task => {
      if (task.id === activeTaskId) {
        return { ...task, order: overOrder };
      } else if (activeOrder < overOrder) {
        if (task.order > activeOrder && task.order <= overOrder) {
          return { ...task, order: task.order - 1 };
        }
      } else if (activeOrder > overOrder) {
        if (task.order >= overOrder && task.order < activeOrder) {
          return { ...task, order: task.order + 1 };
        }
      }
      return task;
    });

    const taskIds = updatedTasks
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(task => task.id);

    await reorderTasks(taskIds);
    await refreshData(); // Aguardar atualização
  };

  const handleConcludeTask = async (taskId: string) => {
    await concludeTask(taskId);
    await refreshData(); // Aguardar atualização
  };

  const handleUnconcludeTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await updateTask(taskId, {
        ...task,
        isConcluded: false,
        status: 'pending',
        updatedAt: new Date().toISOString()
      });
      await refreshData(); // Aguardar atualização
    } catch (error) {
      console.error('Erro ao desfazer conclusão da tarefa:', error);
    }
  };

  // Verificar se todas as tarefas do período estão concluídas
  const allTasksConcluded = tasks.length > 0 && tasks.every(task => task.isConcluded);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Tarefas</h1>
          <p className="text-muted-foreground">
            Controle e organize suas tarefas diárias
          </p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Indicador de Dia Fechado */}
      {allTasksConcluded && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">🎉 Período Fechado! Todas as tarefas foram concluídas!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Horizontais */}
      <TaskFiltersHorizontal 
        currentFilters={taskFilters}
        onFiltersChange={setTaskFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Resumo de Estatísticas Compacto */}
      <TaskStatsCompact tasks={displayTasks} />

      {/* Lista de Tarefas com Drag & Drop */}
      <div className="grid gap-4">
        {displayTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Checkbox para selecionar todas */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={selectedTasks.length === displayTasks.length}
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm text-muted-foreground">
                Selecionar todas ({displayTasks.length} tarefas)
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
                  <div key={task.id} className="flex items-start gap-3">
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
          </>
        )}
        
        <BulkActionsBar 
          selectedTasks={selectedTasks}
          onClearSelection={() => setSelectedTasks([])}
        />
      </div>

      {/* Modais */}
      <TaskHistoryModal
        task={taskForHistory}
        isOpen={!!taskForHistory}
        onClose={() => setTaskForHistory(null)}
      />
      <RescheduleModal onRescheduleComplete={refreshData} />
      <TaskModal onTaskSaved={refreshData} />
    </div>
  );
};

export default TasksPage;
