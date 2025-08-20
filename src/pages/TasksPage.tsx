
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, Calendar, CheckCircle } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TasksStats } from "@/components/tasks/TasksStats";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { BulkActionsBar } from "@/components/tasks/BulkActionsBar";
import { TaskHistoryModal } from "@/components/tasks/TaskHistoryModal";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Task, TaskFilter } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [taskForHistory, setTaskForHistory] = useState<Task | null>(null);
  const [taskFilters, setTaskFilters] = useState<TaskFilter>({
    dateRange: {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });
  const { openTaskModal, openForwardTaskModal, openDeleteModal } = useModalStore();
  const { tasks, updateTask, deleteTask, reorderTasks, concludeTask, refetch } = useSupabaseTasks(taskFilters);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Para múltiplos dias, mostrar a ordem real sem reordenar
  const isMultipleDays = taskFilters.dateRange?.start !== taskFilters.dateRange?.end;
  const displayTasks = isMultipleDays 
    ? filteredTasks.sort((a, b) => {
        // Primeiro por data, depois por ordem
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate);
        }
        return (a.order || 0) - (b.order || 0);
      })
    : filteredTasks;

  const handleTaskSelection = (task: Task, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, task]);
    } else {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    }
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Se status é pending, remover a última baixa
      if (status === 'pending') {
        const newHistory = task.completionHistory?.slice(0, -1) || [];
        updateTask(taskId, { 
          status: 'pending',
          completionHistory: newHistory,
          updatedAt: new Date().toISOString()
        });
        return;
      }

      // Verificar se já tem uma baixa
      const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
      const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
      
      // Se já tem a mesma baixa, não fazer nada (será tratado no TaskCard)
      if (hasCompletion && lastCompletion?.status === status) {
        return;
      }

      const completionRecord = {
        completedAt: getCurrentDateInSaoPaulo(),
        status: status as 'completed' | 'not-done',
        date: task.scheduledDate,
        wasForwarded: false
      };

      const updatedCompletionHistory = [
        ...(task.completionHistory || []),
        completionRecord
      ];

      updateTask(taskId, { 
        status,
        completionHistory: updatedCompletionHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const handleForwardTask = (task: Task) => {
    // Perguntar se quer manter a ordenação
    const keepOrder = window.confirm('Deseja manter a ordenação da tarefa ao reagendar?');
    
    // Perguntar se quer manter as baixas do checklist
    const keepChecklistStatus = window.confirm('Deseja manter o status dos itens do checklist?');
    
    // Passar essas opções para o modal de reagendamento
    openForwardTaskModal(task, { keepOrder, keepChecklistStatus });
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

  const handleDragEnd = (event: DragEndEvent) => {
    // Não permitir reordenação se está visualizando múltiplos dias
    if (isMultipleDays) return;

    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = displayTasks.findIndex(task => task.id === active.id);
      const newIndex = displayTasks.findIndex(task => task.id === over?.id);
      
      const reorderedTasks = arrayMove(displayTasks, oldIndex, newIndex);
      const taskIds = reorderedTasks.map(task => task.id);
      
      // Atualizar ordem no banco
      reorderTasks(taskIds);
    }
  };

  const handleConcludeTask = async (taskId: string) => {
    await concludeTask(taskId);
    refetch();
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
      refetch();
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

      {/* Busca */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Filtros */}
      <TaskFilters 
        currentFilters={taskFilters}
        onFiltersChange={(filters) => {
          setTaskFilters(filters);
          // Se limpar filtros, limpar busca também
          if (!filters.dateRange && !filters.status?.length && !filters.type?.length && !filters.assignedPersonId) {
            setSearchQuery('');
          }
        }}
      />

      {/* Resumo de Estatísticas */}
      <TasksStats tasks={displayTasks} />

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
                    <TaskCard 
                      task={task} 
                      taskIndex={isMultipleDays ? undefined : index} // Não mostrar índice para múltiplos dias
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
        )}
        
        <BulkActionsBar 
          selectedTasks={selectedTasks}
          onClearSelection={() => setSelectedTasks([])}
        />
      </div>

      {/* Modal de Histórico */}
      <TaskHistoryModal
        task={taskForHistory}
        isOpen={!!taskForHistory}
        onClose={() => setTaskForHistory(null)}
      />
    </div>
  );
};

export default TasksPage;
