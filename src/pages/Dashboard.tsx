import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle, Clock, Users, TrendingUp, Target } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { TaskFilter, Task } from "@/types";
import { useState } from "react";
import { searchInTask } from "@/lib/searchUtils";
import { sortTasks, SortOption } from "@/lib/taskUtils";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [taskFilters, setTaskFilters] = useState<TaskFilter>({
    dateRange: {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });

  const { openTaskModal, openPersonModal, openTeamMemberModal, openDailyCloseModal } = useModalStore();
  const { tasks, updateTask, deleteTask, concludeTask, refetch } = useSupabaseTasks(taskFilters);
  const { people } = useSupabasePeople();
  const { teamMembers } = useSupabaseTeamMembers();

  // Aplicar busca e ordenação para as tarefas da lista
  const filteredTasks = tasks.filter(task => searchInTask(task, searchQuery));
  const sortedTasks = sortTasks(filteredTasks, sortBy);

  // Estatísticas para os cards (usar todas as tarefas do período)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isConcluded).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const forwardedTasks = tasks.filter(task => task.isForwarded).length;
  
  // Tarefas definitivas: concluídas e que nunca foram reagendadas
  const definitiveTasks = tasks.filter(task => 
    task.isConcluded && 
    (!task.forwardHistory || task.forwardHistory.length === 0) &&
    task.forwardCount === 0
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (status === 'pending') {
        const newHistory = task.completionHistory?.slice(0, -1) || [];
        updateTask(taskId, { 
          status: 'pending',
          completionHistory: newHistory,
          updatedAt: new Date().toISOString()
        });
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

      updateTask(taskId, { 
        status,
        completionHistory: updatedCompletionHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua produtividade
          </p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              para o período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              aguardando execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Definitivo</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{definitiveTasks}</div>
            <p className="text-xs text-muted-foreground">
              feitas sem reagendar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repassadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{forwardedTasks}</div>
            <p className="text-xs text-muted-foreground">
              reagendadas ou delegadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <TaskFiltersHorizontal 
        currentFilters={taskFilters}
        onFiltersChange={setTaskFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Tarefas de Hoje */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tarefas do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                <Button className="mt-4" onClick={() => openTaskModal()}>
                  Criar Primeira Tarefa
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedTasks.slice(0, 5).map((task, index) => (
                  <TaskCardImproved
                    key={task.id}
                    task={task}
                    people={people}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                    onConclude={() => handleConcludeTask(task.id)}
                    onUnconclude={() => handleUnconcludeTask(task.id)}
                  />
                ))}
                {sortedTasks.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    ... e mais {sortedTasks.length - 5} tarefas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo da Equipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumo da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pessoas cadastradas</span>
                <span className="font-semibold">{people.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Membros da equipe</span>
                <span className="font-semibold">{teamMembers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de colaboradores</span>
                <span className="font-semibold">{people.length + teamMembers.length}</span>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => openPersonModal()}>
                  Nova Pessoa
                </Button>
                <Button variant="outline" size="sm" onClick={() => openTeamMemberModal()}>
                  Novo Membro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => openDailyCloseModal(getCurrentDateInSaoPaulo())}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Fechamento Diário</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Ver Estatísticas</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Ir para Calendário</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
