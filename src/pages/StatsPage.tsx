
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Clock, Users, Target, BarChart3, PieChart, Activity } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useState, useMemo } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const StatsPage = () => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all'>('month');
  
  // Definir período
  const today = new Date();
  const getDateRange = () => {
    switch (timePeriod) {
      case 'week':
        return {
          start: format(subDays(today, 7), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
      case 'month':
        return {
          start: format(startOfMonth(today), 'yyyy-MM-dd'),
          end: format(endOfMonth(today), 'yyyy-MM-dd')
        };
      default:
        return undefined;
    }
  };

  const { tasks } = useSupabaseTasks(getDateRange() ? { dateRange: getDateRange()! } : undefined);
  const { people } = useSupabasePeople();

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isConcluded).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Por prioridade
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;
    
    // Por categoria
    const categoryStats = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Por tipo
    const typeStats = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Por pessoa
    const personStats = tasks.reduce((acc, task) => {
      if (task.assignedPersonId) {
        acc[task.assignedPersonId] = (acc[task.assignedPersonId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Tempo investimento
    const timeStats = tasks.reduce((acc, task) => {
      acc[task.timeInvestment] = (acc[task.timeInvestment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Reagendamentos
    const rescheduled = tasks.filter(t => 
      t.forwardHistory?.some(forward => forward.originalDate === t.scheduledDate)
    ).length;
    
    const delegated = tasks.filter(t => t.assignedPersonId).length;
    
    // Tarefas por dia
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = task.scheduledDate;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgTasksPerDay = Object.keys(tasksByDate).length > 0 
      ? Math.round(total / Object.keys(tasksByDate).length) 
      : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      categoryStats,
      typeStats,
      personStats,
      timeStats,
      rescheduled,
      delegated,
      avgTasksPerDay,
      workingDays: Object.keys(tasksByDate).length
    };
  }, [tasks]);

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'week': return 'Última Semana';
      case 'month': return 'Este Mês';
      default: return 'Todos os Períodos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estatísticas</h1>
          <p className="text-muted-foreground">
            Métricas detalhadas de produtividade e desempenho
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timePeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('week')}
            size="sm"
          >
            Semana
          </Button>
          <Button 
            variant={timePeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('month')}
            size="sm"
          >
            Mês
          </Button>
          <Button 
            variant={timePeriod === 'all' ? 'default' : 'outline'}
            onClick={() => setTimePeriod('all')}
            size="sm"
          >
            Tudo
          </Button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} de {stats.total} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgTasksPerDay}</div>
            <p className="text-xs text-muted-foreground">
              tarefas por dia ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.workingDays}</div>
            <p className="text-xs text-muted-foreground">
              com atividades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Prioridade */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm">Alta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.highPriority}</span>
                <Badge variant="destructive" className="text-xs">
                  {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm">Média</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.mediumPriority}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Baixa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.lowPriority}</span>
                <Badge variant="outline" className="text-xs">
                  {stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {Object.keys(stats.categoryStats).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria encontrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo e Tempo */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {Object.keys(stats.typeStats).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum tipo encontrado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Distribuição por Tempo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.timeStats).map(([time, count]) => (
              <div key={time} className="flex items-center justify-between">
                <span className="text-sm capitalize">{time}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights Adicionais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tarefas por Pessoa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.personStats).map(([personId, count]) => {
              const person = people.find(p => p.id === personId);
              return (
                <div key={personId} className="flex items-center justify-between">
                  <span className="text-sm">{person?.name || 'Pessoa não encontrada'}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              );
            })}
            {Object.keys(stats.personStats).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma delegação encontrada
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Gestão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tarefas Delegadas:</span>
              <Badge variant="secondary">{stats.delegated}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Reagendamentos:</span>
              <Badge variant="outline">{stats.rescheduled}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Delegação:</span>
              <Badge variant="default">
                {stats.total > 0 ? Math.round((stats.delegated / stats.total) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.completionRate >= 90 ? '🏆' : stats.completionRate >= 70 ? '👍' : '📈'}
                </div>
                <p className="text-sm font-medium">
                  {stats.completionRate >= 90 
                    ? 'Performance Excelente' 
                    : stats.completionRate >= 70 
                    ? 'Performance Boa' 
                    : 'Oportunidade de Melhoria'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getPeriodLabel()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
