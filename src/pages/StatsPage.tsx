
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, Clock, Target, Calendar as CalendarIcon, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { useState, useMemo } from "react";
import { TaskFilter } from "@/types";
import { getCurrentDateInSaoPaulo, getDateRange } from "@/lib/utils";
import { getTimeInMinutes } from "@/lib/taskUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatsPage = () => {
  const today = getCurrentDateInSaoPaulo();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  
  // Calcular filtros baseado no período selecionado
  const filters = useMemo((): TaskFilter => {
    if (period === 'custom' && customStartDate && customEndDate) {
      return {
        dateRange: {
          start: format(customStartDate, 'yyyy-MM-dd'),
          end: format(customEndDate, 'yyyy-MM-dd')
        }
      };
    }
    return {
      dateRange: getDateRange(period === 'custom' ? 'month' : period)
    };
  }, [period, customStartDate, customEndDate]);

  const { tasks } = useSupabaseTasks(filters);
  const { people } = useSupabasePeople();
  const { teamMembers } = useSupabaseTeamMembers();

  // Estatísticas básicas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isConcluded).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => 
    task.status === 'pending' && task.scheduledDate < today
  ).length;

  // Distribuição por prioridade
  const priorityStats = [
    { name: 'Extrema', value: tasks.filter(t => t.priority === 'extreme').length, color: '#FF4444' },
    { name: 'Prioridade', value: tasks.filter(t => t.priority === 'priority').length, color: '#FF8042' },
    { name: 'Normal', value: tasks.filter(t => t.priority === 'none').length, color: '#00C49F' }
  ];

  // Distribuição por tipo
  const typeStats = [
    { name: 'Próprias', value: tasks.filter(t => t.type === 'own-task').length },
    { name: 'Reuniões', value: tasks.filter(t => t.type === 'meeting').length },
    { name: 'Delegadas', value: tasks.filter(t => t.type === 'delegated-task').length }
  ];

  // Distribuição por tempo estimado
  const timeStats = [
    { name: '5min', value: tasks.filter(t => t.timeInvestment === 'low').length },
    { name: '30min', value: tasks.filter(t => t.timeInvestment === 'medium').length },
    { name: '1h', value: tasks.filter(t => t.timeInvestment === 'high').length }
  ];

  // Tarefas delegadas por pessoa (people) e equipe (team_members)
  const delegatedTasks = tasks.filter(t => t.assignedPersonId);
  
  const delegatedTasksByAssignee = [...people, ...teamMembers].map(assignee => {
    const assigneeTasks = delegatedTasks.filter(t => t.assignedPersonId === assignee.id);
    const completedCount = assigneeTasks.filter(t => t.isConcluded).length;
    const pendingCount = assigneeTasks.filter(t => t.status === 'pending').length;
    const notDoneCount = assigneeTasks.filter(t => !t.isConcluded && t.status !== 'pending').length;
    
    return {
      name: assignee.name,
      type: 'name' in assignee && assignee.role ? `Pessoa - ${assignee.role}` : `Equipe - ${assignee.role || 'Membro'}`,
      total: assigneeTasks.length,
      feitas: completedCount,
      'não feitas': notDoneCount,
      pendentes: pendingCount,
      completionRate: assigneeTasks.length > 0 ? Math.round((completedCount / assigneeTasks.length) * 100) : 0
    };
  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  // Tarefas por pessoa (mantendo o original para compatibilidade)
  const tasksByPerson = people.map(person => ({
    name: person.name,
    total: tasks.filter(t => t.assignedPersonId === person.id).length,
    completed: tasks.filter(t => t.assignedPersonId === person.id && t.isConcluded).length
  })).filter(p => p.total > 0);

  // Tempo total estimado
  const totalEstimatedTime = tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment);
  }, 0);

  // Métricas de gestão
  const delegatedTasksCount = tasks.filter(t => t.assignedPersonId).length;
  const rescheduledTasksCount = tasks.filter(t => t.forwardCount > 0).length;
  const tasksWithChecklist = tasks.filter(t => t.subItems && t.subItems.length > 0).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const delegationRate = totalTasks > 0 ? Math.round((delegatedTasksCount / totalTasks) * 100) : 0;
  const reschedulingRate = totalTasks > 0 ? Math.round((rescheduledTasksCount / totalTasks) * 100) : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estatísticas</h1>
          <p className="text-muted-foreground">
            Análise completa do seu desempenho
            {period === 'custom' && customStartDate && customEndDate && (
              <span className="ml-2 text-sm">
                ({format(customStartDate, "dd/MM/yyyy", { locale: ptBR })} - {format(customEndDate, "dd/MM/yyyy", { locale: ptBR })})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'week' | 'month' | 'year' | 'custom') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {period === 'custom' && (
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
                    className="pointer-events-auto"
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
                    className="pointer-events-auto"
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

      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} de {totalTasks} tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatTime(totalEstimatedTime)}</div>
            <p className="text-xs text-muted-foreground">
              tempo total das tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Delegação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{delegationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {delegatedTasksCount} tarefas delegadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Reagendamento</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reschedulingRate}%</div>
            <p className="text-xs text-muted-foreground">
              {rescheduledTasksCount} reagendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise por pessoa e tempo */}
      <div className="grid gap-6">
        {/* Novo gráfico de tarefas delegadas */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas por Equipe</CardTitle>
            <p className="text-sm text-muted-foreground">
              Quantidade de tarefas feitas, não feitas e pendentes por pessoa e equipe
            </p>
          </CardHeader>
          <CardContent>
            {delegatedTasksByAssignee.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={delegatedTasksByAssignee} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground">{data.type}</p>
                            <div className="space-y-1 mt-2">
                              <p className="text-sm">
                                <span className="text-green-600">Feitas: {data.feitas}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-red-600">Não feitas: {data['não feitas']}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-orange-600">Pendentes: {data.pendentes}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-blue-600">Total: {data.total}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="feitas" fill="#22c55e" name="Feitas" />
                  <Bar dataKey="não feitas" fill="#ef4444" name="Não feitas" />
                  <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                Nenhuma tarefa delegada encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráficos menores lado a lado */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tempo Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers - Delegadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {delegatedTasksByAssignee.slice(0, 5).map((assignee, index) => (
                  <div key={assignee.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{assignee.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{assignee.total} tarefas</p>
                      <p className="text-sm text-muted-foreground">{assignee.completionRate}% concluídas</p>
                    </div>
                  </div>
                ))}
                {delegatedTasksByAssignee.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa delegada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights e métricas avançadas */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Insights de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tarefas em Atraso</span>
                <Badge variant={overdueTasks > 0 ? "destructive" : "secondary"}>
                  {overdueTasks}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Com Checklist</span>
                <Badge variant="outline">{tasksWithChecklist}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equipe Ativa</span>
                <Badge variant="outline">{people.length}</Badge>
              </div>
            </div>
            
            {completionRate >= 80 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  🎉 Excelente produtividade!
                </p>
                <p className="text-xs text-green-600">
                  Você está mantendo uma alta taxa de conclusão
                </p>
              </div>
            )}
            
            {reschedulingRate > 30 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">
                  ⚠️ Muitos reagendamentos
                </p>
                <p className="text-xs text-orange-600">
                  Considere revisar o planejamento das tarefas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Gestão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Delegação</span>
                  <span className="text-sm">{delegationRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${delegationRate}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Reagendamento</span>
                  <span className="text-sm">{reschedulingRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${reschedulingRate}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Conclusão</span>
                  <span className="text-sm">{completionRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objetivos de Produtividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Conclusão</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{completionRate}%</span>
                  {completionRate >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Meta: 80%</span>
                <Badge variant={completionRate >= 80 ? "default" : "secondary"}>
                  {completionRate >= 80 ? "Atingida" : "Pendente"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Reagendamentos</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{reschedulingRate}%</span>
                  {reschedulingRate <= 20 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Meta: ≤ 20%</span>
                <Badge variant={reschedulingRate <= 20 ? "default" : "secondary"}>
                  {reschedulingRate <= 20 ? "Atingida" : "Acima"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
