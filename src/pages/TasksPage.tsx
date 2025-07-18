import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/tasks/TaskCard";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { openTaskModal } = useModalStore();
  const { tasks } = useTasks();

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;