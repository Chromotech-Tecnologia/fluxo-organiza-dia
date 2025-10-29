import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getTimeInMinutes, formatTime } from "@/lib/taskUtils";
import { Clock, TrendingUp, CheckCircle2, XCircle, Calendar, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type PeriodType = 'day' | 'week' | 'month' | 'year';

const TimeManagementPage = () => {
  const [period, setPeriod] = useState<PeriodType>('week');
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'pending' | 'meeting' | 'delegated'>('all');

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'day':
        return {
          start: format(startOfDay(now), 'yyyy-MM-dd'),
          end: format(endOfDay(now), 'yyyy-MM-dd')
        };
      case 'week':
        return {
          start: format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd')
        };
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'year':
        return {
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(endOfYear(now), 'yyyy-MM-dd')
        };
    }
  };

  const { tasks: allTasks } = useSupabaseTasks({
    dateRange: getDateRange()
  });

  // Filter tasks based on selected type
  const tasks = useMemo(() => {
    if (filterType === 'all') return allTasks;
    if (filterType === 'completed') return allTasks.filter(t => t.isConcluded);
    if (filterType === 'pending') return allTasks.filter(t => !t.isConcluded);
    if (filterType === 'meeting') return allTasks.filter(t => t.type === 'meeting');
    if (filterType === 'delegated') return allTasks.filter(t => t.type === 'delegated-task');
    return allTasks;
  }, [allTasks, filterType]);

  // Calculate time statistics
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.isConcluded);
    const pending = tasks.filter(t => !t.isConcluded);
    const meetings = tasks.filter(t => t.type === 'meeting');
    const delegated = tasks.filter(t => t.type === 'delegated-task');
    const forwarded = tasks.filter(t => t.isForwarded);

    const totalTime = tasks.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
    const completedTime = completed.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
    const pendingTime = pending.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
    const meetingTime = meetings.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
    const delegatedTime = delegated.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);

    return {
      total: tasks.length,
      completed: completed.length,
      pending: pending.length,
      meetings: meetings.length,
      delegated: delegated.length,
      forwarded: forwarded.length,
      totalTime,
      completedTime,
      pendingTime,
      meetingTime,
      delegatedTime,
      completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
    };
  }, [tasks]);

  // Data for time distribution by type
  const timeByTypeData = useMemo(() => {
    const types = ['task', 'meeting', 'delegated-task'];
    return types.map(type => {
      const typeTasks = tasks.filter(t => t.type === type);
      const time = typeTasks.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
      return {
        name: type === 'task' ? 'Tarefas' : type === 'meeting' ? 'Reuniões' : 'Delegadas',
        value: time,
        count: typeTasks.length,
      };
    }).filter(item => item.value > 0);
  }, [tasks]);

  // Data for time distribution by priority
  const timeByPriorityData = useMemo(() => {
    const priorities = ['extreme', 'priority', 'none'];
    return priorities.map(priority => {
      const priorityTasks = tasks.filter(t => t.priority === priority);
      const time = priorityTasks.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
      return {
        name: priority === 'extreme' ? 'Extrema' : priority === 'priority' ? 'Prioridade' : 'Normal',
        value: time,
        count: priorityTasks.length,
      };
    }).filter(item => item.value > 0);
  }, [tasks]);

  // Data for completed vs pending
  const statusData = [
    { name: 'Concluídas', value: stats.completedTime, count: stats.completed },
    { name: 'Pendentes', value: stats.pendingTime, count: stats.pending },
  ].filter(item => item.value > 0);

  // Data for time investment distribution
  const timeInvestmentData = useMemo(() => {
    const investments = ['low', 'medium', 'high'];
    return investments.map(investment => {
      const invTasks = tasks.filter(t => t.timeInvestment === investment);
      const time = invTasks.reduce((sum, t) => sum + getTimeInMinutes(t.timeInvestment, t.customTimeMinutes), 0);
      return {
        name: investment === 'low' ? 'Baixo' : investment === 'medium' ? 'Médio' : 'Alto',
        value: time,
        count: invTasks.length,
      };
    }).filter(item => item.value > 0);
  }, [tasks]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return 'Hoje';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'year': return 'Este Ano';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Tempo</h1>
          <p className="text-muted-foreground">
            Analise onde você está investindo seu tempo
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <Tabs value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
            <TabsList>
              <TabsTrigger value="day">Diário</TabsTrigger>
              <TabsTrigger value="week">Semanal</TabsTrigger>
              <TabsTrigger value="month">Mensal</TabsTrigger>
              <TabsTrigger value="year">Anual</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Selector */}
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="meeting">Reuniões</SelectItem>
              <SelectItem value="delegated">Delegadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalTime)}</div>
            <p className="text-xs text-muted-foreground">{stats.total} tarefas {getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Concluído</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatTime(stats.completedTime)}</div>
            <p className="text-xs text-muted-foreground">{stats.completed} tarefas concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Pendente</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatTime(stats.pendingTime)}</div>
            <p className="text-xs text-muted-foreground">{stats.pending} tarefas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição: Concluídas vs Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Tempo", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatTime(entry.value)} (${entry.count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo por Tipo de Tarefa</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Tempo", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeByTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatTime(value)} />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm">Tempo: {formatTime(payload[0].value as number)}</p>
                            <p className="text-sm">Tarefas: {payload[0].payload.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Tempo", color: "hsl(var(--chart-3))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeByPriorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatTime(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeByPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time Investment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Investimento de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Tempo", color: "hsl(var(--chart-4))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeInvestmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatTime(value)} />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm">Tempo: {formatTime(payload[0].value as number)}</p>
                            <p className="text-sm">Tarefas: {payload[0].payload.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reuniões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <Badge variant="secondary">{stats.meetings} reuniões</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tempo</span>
                <span className="font-medium">{formatTime(stats.meetingTime)}</span>
              </div>
              <Progress 
                value={stats.totalTime > 0 ? (stats.meetingTime / stats.totalTime) * 100 : 0} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.totalTime > 0 ? ((stats.meetingTime / stats.totalTime) * 100).toFixed(1) : 0}% do tempo total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tarefas Delegadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <Badge variant="secondary">{stats.delegated} tarefas</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tempo</span>
                <span className="font-medium">{formatTime(stats.delegatedTime)}</span>
              </div>
              <Progress 
                value={stats.totalTime > 0 ? (stats.delegatedTime / stats.totalTime) * 100 : 0} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                {stats.totalTime > 0 ? ((stats.delegatedTime / stats.totalTime) * 100).toFixed(1) : 0}% do tempo total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tarefas Reagendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <Badge variant="secondary">{stats.forwarded} tarefas</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa</span>
                <span className="font-medium">
                  {stats.total > 0 ? ((stats.forwarded / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.forwarded / stats.total) * 100 : 0} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">
                das tarefas foram reagendadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeManagementPage;
