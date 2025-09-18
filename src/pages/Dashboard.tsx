
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle, Clock, Users, TrendingUp, Target, ArrowRight } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { Link } from "react-router-dom";
import { TaskFilter, SortOption, TaskStatus, Task } from "@/types";
import { useState } from "react";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MeetingsCard } from "@/components/dashboard/MeetingsCard";
import { TaskHistoryModal } from "@/components/tasks/TaskHistoryModal";

const Dashboard = () => {
  const { openTaskModal, openRescheduleModal, openDeleteModal } = useModalStore();
  const [taskForHistory, setTaskForHistory] = useState<Task | null>(null);
  const today = getCurrentDateInSaoPaulo();
  
  const [filters, setFilters] = useState<TaskFilter>({
    dateRange: {
      start: today,
      end: today
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("order");
  
  const { tasks: todayTasks, concludeTask, updateTask, refetch } = useSupabaseTasks(filters);
  const { people } = useSupabasePeople();

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter(task => task.isConcluded).length;
  const pendingTasks = todayTasks.filter(task => task.status === 'pending').length;
  const delegatedTasks = todayTasks.filter(task => task.assignedPersonId).length;
  const rescheduledTasks = todayTasks.filter(task => 
    task.forwardHistory?.some(forward => forward.originalDate === task.scheduledDate)
  ).length;
  
  // Tarefas definitivas: concluídas e que nunca foram reagendadas
  const definitiveTasks = todayTasks.filter(task => 
    task.isConcluded && 
    (!task.forwardHistory || task.forwardHistory.length === 0) &&
    task.forwardCount === 0
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleConcludeTask = async (taskId: string) => {
    await concludeTask(taskId);
    refetch();
  };

  const handleUnconcludeTask = async (taskId: string) => {
    const task = todayTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        isConcluded: false,
        concludedAt: undefined,
        status: 'pending'
      });
      refetch();
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    // Only allow certain status changes for this handler
    if (status === 'pending' || status === 'completed' || status === 'not-done') {
      await updateTask(taskId, { status });
      refetch();
    }
  };

  const handleForwardTask = (task: Task) => {
    openRescheduleModal(task);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas atividades
          </p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros */}
      <DashboardFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              para o período filtrado
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
            <CardTitle className="text-sm font-medium">Delegadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{delegatedTasks}</div>
            <p className="text-xs text-muted-foreground">
              com responsáveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reagendadas</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{rescheduledTasks}</div>
            <p className="text-xs text-muted-foreground">
              movidas de data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tarefas do Período</CardTitle>
              <Link to="/tasks">
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma tarefa encontrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Não há tarefas para os filtros selecionados
                  </p>
                  <Button onClick={() => openTaskModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todayTasks.slice(0, 8).map((task) => (
                    <TaskCardImproved 
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => handleStatusChange(task.id, status)}
                      onConclude={() => handleConcludeTask(task.id)}
                      onUnconclude={() => handleUnconcludeTask(task.id)}
                      onForward={() => handleForwardTask(task)}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      onHistory={() => handleTaskHistory(task)}
                    />
                  ))}
                  {todayTasks.length > 8 && (
                    <div className="text-center pt-4">
                      <Link to="/tasks">
                        <Button variant="outline" size="sm">
                          Ver mais {todayTasks.length - 8} tarefas
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>

              {totalTasks > 0 && completionRate === 100 && (
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-800">
                    🎉 Período completo!
                  </p>
                  <p className="text-xs text-green-600">
                    Todas as tarefas foram concluídas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <MeetingsCard />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pessoas ({people.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {people.slice(0, 5).map((person) => (
                  <div key={person.id} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>{person.name}</span>
                  </div>
                ))}
                {people.length > 5 && (
                  <Link to="/people">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Ver todas ({people.length})
                    </Button>
                  </Link>
                )}
                {people.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma pessoa cadastrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => openTaskModal()}
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
              
              <Link to="/calendar" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Calendário
                </Button>
              </Link>
              
              <Link to="/reports" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Relatórios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskHistoryModal
        task={taskForHistory}
        isOpen={!!taskForHistory}
        onClose={() => setTaskForHistory(null)}
      />
    </div>
  );
};

export default Dashboard;
