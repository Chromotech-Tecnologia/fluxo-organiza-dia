import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Calendar,
  Plus
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { usePeople } from "@/hooks/usePeople";
import { useModalStore } from "@/stores/useModalStore";

const Dashboard = () => {
  const { getStats, getTasksByDate } = useTasks();
  const { people } = usePeople();
  const { openTaskModal, openDailyCloseModal } = useModalStore();
  
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = getTasksByDate(today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de controle de tarefas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => openTaskModal()}
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openDailyCloseModal()}
          >
            <Clock className="h-4 w-4" />
            Fechamento Diário
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.location.href = '/calendar'}
          >
            <Calendar className="h-4 w-4" />
            Ver Calendário
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats.totalTasks}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as tarefas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-foreground">
                {stats.completionRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedTasks} de {stats.totalTasks} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-foreground">{stats.pendingTasks}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-foreground">{stats.overdueTasks}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Precisam de atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas de Hoje e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarefas de Hoje */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tarefas de Hoje
            </CardTitle>
            <CardDescription>
              {todayTasks.length} tarefas programadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa programada para hoje</p>
              </div>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      task.priority === 'urgent' ? 'destructive' :
                      task.priority === 'complex' ? 'secondary' : 'default'
                    }>
                      {task.priority === 'urgent' ? 'Urgente' :
                       task.priority === 'complex' ? 'Complexa' : 'Simples'}
                    </Badge>
                    <Badge variant="outline">
                      {task.type === 'meeting' ? 'Reunião' :
                       task.type === 'own-task' ? 'Própria' : 'Repassada'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            {todayTasks.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  Ver todas ({todayTasks.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Rápido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumo Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pessoas Cadastradas</span>
                <span className="font-medium">{people.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Média de Repasses</span>
                <span className="font-medium">{stats.averageForwards.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tarefas Hoje</span>
                <span className="font-medium">{todayTasks.length}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Ações Rápidas</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => openTaskModal()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/people'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Pessoas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => openDailyCloseModal()}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Fechar Dia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;