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
import { BulkActionsBar } from "@/components/tasks/BulkActionsBar";
import { Task } from "@/types";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const { openTaskModal } = useModalStore();
  const { tasks, updateTask } = useTasks();

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

      const completionRecord = {
        completedAt: new Date().toISOString(),
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

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Data
            </Button>
          </div>
        </CardContent>
      </Card>

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