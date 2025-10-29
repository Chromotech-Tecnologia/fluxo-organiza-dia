
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useModalStore } from "@/stores/useModalStore";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, subDays, addWeeks, subWeeks, startOfYear, endOfYear, addYears, subYears, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task, TaskFilter, SortOption } from "@/types";
import { TaskFiltersImproved } from "@/components/tasks/TaskFiltersImproved";
import { sortTasks } from "@/lib/taskUtils";
import { filterTasks } from "@/lib/searchUtils";

type ViewType = 'day' | 'week' | 'month' | 'year';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [filters, setFilters] = useState<TaskFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const { openTaskModal } = useModalStore();

  // Calculate date ranges based on view type
  const getDateRange = () => {
    switch (viewType) {
      case 'day':
        return {
          start: format(startOfDay(currentDate), 'yyyy-MM-dd'),
          end: format(endOfDay(currentDate), 'yyyy-MM-dd')
        };
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start: format(weekStart, 'yyyy-MM-dd'),
          end: format(weekEnd, 'yyyy-MM-dd')
        };
      case 'year':
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        return {
          start: format(yearStart, 'yyyy-MM-dd'),
          end: format(yearEnd, 'yyyy-MM-dd')
        };
      case 'month':
      default:
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return {
          start: format(monthStart, 'yyyy-MM-dd'),
          end: format(monthEnd, 'yyyy-MM-dd')
        };
    }
  };

  const { tasks: rawTasks } = useSupabaseTasks({
    dateRange: getDateRange()
  });

  // Apply filters, search and sorting
  const tasks = useMemo(() => {
    let filtered = filterTasks(rawTasks, searchQuery, filters);
    return sortTasks(filtered, sortBy);
  }, [rawTasks, searchQuery, filters, sortBy]);

  // Gerar os dias do calendário baseado no tipo de visualização
  const getCalendarDays = () => {
    switch (viewType) {
      case 'day':
        return [currentDate];
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'year':
        // Para visualização anual, retornamos os meses do ano
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        return eachMonthOfInterval({ start: yearStart, end: yearEnd });
      case 'month':
      default:
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  };

  const calendarDays = getCalendarDays();

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
    return grouped;
  }, [tasks]);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (viewType) {
        case 'day':
          return direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1);
        case 'week':
          return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
        case 'year':
          return direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1);
        case 'month':
        default:
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      }
    });
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
      case 'year':
        return format(currentDate, 'yyyy', { locale: ptBR });
      case 'month':
      default:
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'extreme': return 'bg-red-500';
      case 'priority': return 'bg-yellow-500';
      case 'none': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize suas tarefas organizadas por data
          </p>
        </div>
        <Button className="gap-2" onClick={() => openTaskModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros Avançados */}
      <TaskFiltersImproved
        currentFilters={filters}
        onFiltersChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              {getViewTitle()}
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
                <TabsList>
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                  <TabsTrigger value="year">Ano</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewType === 'month' && (
            <>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid do calendário mensal */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                  const dayTasks = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const completedTasks = dayTasks.filter(task => task.isConcluded).length;
                  const totalTasks = dayTasks.length;

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        min-h-[120px] p-2 border border-border rounded-lg
                        ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                        ${isToday ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      {/* Número do dia */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`
                          text-sm font-medium
                          ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                          ${isToday ? 'text-primary font-bold' : ''}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {totalTasks > 0 && (
                          <Badge variant="secondary" className="text-xs px-1">
                            {completedTasks}/{totalTasks}
                          </Badge>
                        )}
                      </div>

                      {/* Tarefas do dia */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <div
                            key={task.id}
                            className={`
                              text-xs p-1 rounded truncate cursor-pointer
                              ${task.isConcluded 
                                ? 'bg-green-100 text-green-800 line-through' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }
                            `}
                            title={task.title}
                            onClick={() => openTaskModal(task)}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                              <span className="truncate">{task.title}</span>
                            </div>
                          </div>
                        ))}
                        
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground p-1">
                            +{dayTasks.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewType === 'week' && (
            <>
              {/* Cabeçalho da semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {calendarDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toString()} className="text-center p-2">
                      <div className="text-sm text-muted-foreground">{format(day, 'EEE', { locale: ptBR })}</div>
                      <div className={`text-lg font-medium ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid da semana */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const completedTasks = dayTasks.filter(task => task.isConcluded).length;
                  const totalTasks = dayTasks.length;

                  return (
                    <div
                      key={day.toString()}
                      className={`
                        min-h-[300px] p-3 border border-border rounded-lg bg-background
                        ${isToday ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {format(day, 'dd/MM')}
                        </span>
                        {totalTasks > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {completedTasks}/{totalTasks}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            className={`
                              text-sm p-2 rounded cursor-pointer
                              ${task.isConcluded 
                                ? 'bg-green-100 text-green-800 line-through' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }
                            `}
                            onClick={() => openTaskModal(task)}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1 ${getPriorityColor(task.priority)}`} />
                              <span className="flex-1">{task.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewType === 'day' && (
            <div className="space-y-4">
              {/* Cabeçalho do dia */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold text-foreground">
                  {format(currentDate, 'EEEE', { locale: ptBR })}
                </h3>
                <p className="text-muted-foreground">
                  {format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                </p>
              </div>

              {/* Tarefas do dia */}
              <div className="space-y-3">
                {getTasksForDate(currentDate).length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    Nenhuma tarefa para este dia
                  </div>
                ) : (
                  getTasksForDate(currentDate).map(task => (
                    <div
                      key={task.id}
                      className={`
                        p-4 border border-border rounded-lg cursor-pointer
                        ${task.isConcluded 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-background hover:bg-muted/50'
                        }
                      `}
                      onClick={() => openTaskModal(task)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(task.priority)}`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.isConcluded ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.isConcluded ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={task.isConcluded ? 'secondary' : 'default'} className="text-xs">
                              {task.isConcluded ? 'Concluída' : 'Pendente'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.priority === 'extreme' ? 'Extrema' : task.priority === 'priority' ? 'Prioridade' : 'Nenhuma'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {viewType === 'year' && (
            <div className="space-y-6">
              {/* Cabeçalho do ano */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-3xl font-bold text-foreground">
                  {format(currentDate, 'yyyy')}
                </h3>
                <p className="text-muted-foreground">
                  Visualização anual das tarefas
                </p>
              </div>

              {/* Grid dos meses */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calendarDays.map((month, index) => {
                  // Obter o range de dias do mês para calcular tarefas
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  
                  // Calcular tarefas do mês
                  const monthTasks = monthDays.reduce((acc: Task[], day) => {
                    const dayTasks = getTasksForDate(day);
                    return [...acc, ...dayTasks];
                  }, []);
                  
                  const completedTasks = monthTasks.filter(task => task.isConcluded).length;
                  const totalTasks = monthTasks.length;
                  
                  return (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        isSameMonth(month, new Date()) ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setCurrentDate(month);
                        setViewType('month');
                      }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-center">
                          {format(month, 'MMMM', { locale: ptBR })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Mini calendário do mês */}
                        <div className="space-y-2">
                          {/* Estatísticas do mês */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tarefas:</span>
                            <span className="font-medium">{totalTasks}</span>
                          </div>
                          {totalTasks > 0 && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Concluídas:</span>
                                <span className="text-green-600">{completedTasks}</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all" 
                                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                                />
                              </div>
                              <div className="text-center text-xs text-muted-foreground">
                                {Math.round((completedTasks / totalTasks) * 100)}% concluído
                              </div>
                            </>
                          )}
                          {totalTasks === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-4">
                              Nenhuma tarefa
                            </div>
                          )}
                          
                          {/* Preview das tarefas mais prioritárias */}
                          {monthTasks.length > 0 && (
                            <div className="space-y-1 mt-3">
                              <div className="text-xs font-medium text-muted-foreground">Principais:</div>
                              {monthTasks
                                .filter(task => !task.isConcluded)
                                .sort((a, b) => {
                                  const priorityOrder = { extreme: 3, priority: 2, none: 1 };
                                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                                })
                                .slice(0, 3)
                                .map(task => (
                                  <div key={task.id} className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                    <span className="text-xs truncate">{task.title}</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo do período */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{tasks.length}</div>
            <p className="text-sm text-muted-foreground">Total de Tarefas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.isConcluded).length}
            </div>
            <p className="text-sm text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(t => !t.isConcluded).length}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((tasks.filter(t => t.isConcluded).length / Math.max(tasks.length, 1)) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
