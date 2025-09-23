
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, TrendingUp, CheckCircle, Clock, Target, BarChart3 } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

const DailyClosePage = () => {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  
  // Definir período com base no modo de visualização
  const today = new Date();
  
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: format(customStartDate, 'yyyy-MM-dd'),
        endDate: format(customEndDate, 'yyyy-MM-dd')
      };
    }
    
    const start = viewMode === 'week' 
      ? format(subDays(today, 7), 'yyyy-MM-dd')
      : format(startOfMonth(today), 'yyyy-MM-dd');
    const end = viewMode === 'month'
      ? format(endOfMonth(today), 'yyyy-MM-dd')
      : format(today, 'yyyy-MM-dd');
      
    return { startDate: start, endDate: end };
  }, [viewMode, customStartDate, customEndDate, today]);

  const { tasks } = useSupabaseTasks({
    dateRange: { start: startDate, end: endDate }
  });

  // Agrupar tarefas por data
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const dateKey = task.scheduledDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    // Ordenar as datas
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const sortedGrouped: Record<string, Task[]> = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });
    
    return sortedGrouped;
  }, [tasks]);

  // Calcular estatísticas gerais
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isConcluded).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const delegatedTasks = tasks.filter(t => t.assignedPersonId).length;
  const rescheduledTasks = tasks.filter(t => 
    t.forwardHistory?.some(forward => forward.originalDate === t.scheduledDate)
  ).length;

  // Calcular média diária
  const workingDays = Object.keys(tasksByDate).length;
  const avgTasksPerDay = workingDays > 0 ? Math.round(totalTasks / workingDays) : 0;
  const avgCompletionRate = workingDays > 0 
    ? Math.round(Object.values(tasksByDate).reduce((acc, dayTasks) => {
        const dayCompleted = dayTasks.filter(t => t.isConcluded).length;
        const dayTotal = dayTasks.length;
        return acc + (dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0);
      }, 0) / workingDays)
    : 0;

  const getDayStats = (dayTasks: Task[]) => {
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.isConcluded).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fechamento Diário</h1>
          <p className="text-muted-foreground">
            Resumo e estatísticas dos dias trabalhados
            {viewMode === 'custom' && customStartDate && customEndDate && (
              <span className="ml-2 text-sm">
                ({format(customStartDate, "dd/MM/yyyy", { locale: ptBR })} - {format(customEndDate, "dd/MM/yyyy", { locale: ptBR })})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
            >
              Última Semana
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
            >
              Este Mês
            </Button>
            <Button 
              variant={viewMode === 'custom' ? 'default' : 'outline'}
              onClick={() => setViewMode('custom')}
            >
              Personalizado
            </Button>
          </div>

          {viewMode === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">até</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>

              {(!customStartDate || !customEndDate) && (
                <Badge variant="outline" className="text-xs">
                  Selecione as datas
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tarefas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              no período
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
              não concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média/Dia</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgTasksPerDay}</div>
            <p className="text-xs text-muted-foreground">
              tarefas por dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              conclusão média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{workingDays}</div>
            <p className="text-xs text-muted-foreground">
              com atividades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Diário</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(tasksByDate).length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-muted-foreground">
                Não há registros para o período selecionado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(tasksByDate).map(([date, dayTasks]) => {
                const stats = getDayStats(dayTasks);
                const dateObj = new Date(date + 'T00:00:00');
                
                return (
                  <div key={date} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {format(dateObj, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(dateObj, 'yyyy-MM-dd')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={stats.rate === 100 ? "default" : stats.rate >= 50 ? "secondary" : "destructive"}>
                          {stats.rate}% concluído
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Concluídas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                        <div className="text-xs text-muted-foreground">Pendentes</div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${stats.rate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insights do Período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tarefas delegadas:</span>
              <Badge variant="outline">{delegatedTasks} tarefas</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Reagendamentos:</span>
              <Badge variant="outline">{rescheduledTasks} tarefas</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Produtividade:</span>
              <Badge variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}>
                {completionRate >= 80 ? "Excelente" : completionRate >= 60 ? "Boa" : "Precisa melhorar"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas</CardTitle>
          </CardHeader>
          <CardContent>
            {completionRate >= 90 && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-800">🎉 Meta atingida!</p>
                <p className="text-xs text-green-600">Excelente produtividade</p>
              </div>
            )}
            {completionRate < 90 && completionRate >= 70 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Target className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-800">Quase lá!</p>
                <p className="text-xs text-yellow-600">Faltam {90 - completionRate}% para a meta</p>
              </div>
            )}
            {completionRate < 70 && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <TrendingUp className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="text-sm font-medium text-red-800">Oportunidade de melhoria</p>
                <p className="text-xs text-red-600">Meta: 90% de conclusão</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyClosePage;
