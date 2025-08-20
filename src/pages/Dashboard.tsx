
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { TaskCard } from "@/components/tasks/TaskCard";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { Link } from "react-router-dom";
import { TaskFilter } from "@/types";

const Dashboard = () => {
  const { openTaskModal } = useModalStore();
  const today = getCurrentDateInSaoPaulo();
  
  const todayFilter: TaskFilter = {
    dateRange: {
      start: today,
      end: today
    }
  };
  
  const { tasks: todayTasks, concludeTask, refetch } = useSupabaseTasks(todayFilter);
  const { people } = useSupabasePeople();

  // Estatísticas de hoje
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter(task => task.isConcluded).length;
  const pendingTasks = todayTasks.filter(task => task.status === 'pending').length;
  const forwardedTasks = todayTasks.filter(task => task.isForwarded).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleStatusChange = (taskId: string, status: 'completed' | 'not-done') => {
    // Esta função será implementada quando necessário
    console.log('Status change:', taskId, status);
  };

  const handleForwardTask = (taskId: string) => {
    // Esta função será implementada quando necessário
    console.log('Forward task:', taskId);
  };

  const handleConcludeTask = async (taskId: string) => {
    await concludeTask(taskId);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas atividades de hoje
          </p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              para hoje
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
            <CardTitle className="text-sm font-medium">Repassadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{forwardedTasks}</div>
            <p className="text-xs text-muted-foreground">
              delegadas ou adiadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarefas de Hoje */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tarefas de Hoje</CardTitle>
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
                    Nenhuma tarefa para hoje
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando uma nova tarefa
                  </p>
                  <Button onClick={() => openTaskModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todayTasks.slice(0, 5).map((task) => (
                    <TaskCard 
                      key={task.id}
                      task={task} 
                      onStatusChange={(status) => {
                        if (status === 'completed' || status === 'not-done') {
                          handleStatusChange(task.id, status);
                        }
                      }}
                      onConclude={() => handleConcludeTask(task.id)}
                      onForward={() => handleForwardTask(task.id)}
                      currentViewDate={today}
                    />
                  ))}
                  {todayTasks.length > 5 && (
                    <div className="text-center pt-4">
                      <Link to="/tasks">
                        <Button variant="outline" size="sm">
                          Ver mais {todayTasks.length - 5} tarefas
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Resumo Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Dia</CardTitle>
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
                    🎉 Dia completo!
                  </p>
                  <p className="text-xs text-green-600">
                    Todas as tarefas foram concluídas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pessoas Ativas */}
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

          {/* Ações Rápidas */}
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
    </div>
  );
};

export default Dashboard;
