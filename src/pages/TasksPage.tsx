import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { BulkActionsBar } from "@/components/tasks/BulkActionsBar";
import { Task, TaskFilter } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
// import { getCurrentDateInSaoPauloISO } from "@/lib/utils";


console.log("Data atual SP (start):", getCurrentDateInSaoPaulo());
console.log("Data atual SP (end):", getCurrentDateInSaoPaulo());


const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [taskFilters, setTaskFilters] = useState<TaskFilter>({
    dateRange: {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });
  const { openTaskModal } = useModalStore();
  const { tasks, updateTask, refetch } = useTasks(taskFilters);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      // Verificar se já tem uma baixa
      const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
      const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
      
      // Não permitir múltiplas baixas do mesmo tipo
      if (hasCompletion && lastCompletion?.status === status) {
        return; // Já tem essa baixa
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
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <TaskFilters 
        currentFilters={taskFilters}
        onFiltersChange={setTaskFilters}
      />

      {/* Lista de Tarefas */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
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
          filteredTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <Checkbox
                checked={selectedTasks.some(t => t.id === task.id)}
                onCheckedChange={(checked) => handleTaskSelection(task, checked as boolean)}
                className="mt-4"
              />
              <div className="flex-1">
                <TaskCard 
                  task={task} 
                  onStatusChange={(status) => handleStatusChange(task.id, status)}
                />
              </div>
            </div>
          ))
        )}
        
        <BulkActionsBar 
          selectedTasks={selectedTasks}
          onClearSelection={() => setSelectedTasks([])}
        />
      </div>
    </div>
  );
};

export default TasksPage;