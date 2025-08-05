import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid,
  List,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/hooks/useTasks";
import { useModalStore } from "@/stores/useModalStore";
import { Task } from "@/types";
import { formatDateToYMDInSaoPaulo } from "@/lib/utils";
import { getDayFromDateString } from "@/lib/utils";



const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const { tasks } = useTasks();
  const { openTaskModal } = useModalStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date): Task[] => {
    const dateString = formatDateToYMDInSaoPaulo(date);

    return tasks.filter(task => {
      // const taskDate = formatDateToYMDInSaoPaulo(new Date(task.scheduledDate));
      const taskDate = getDayFromDateString(task.scheduledDate);
     

      const isScheduled = taskDate === dateString;

      const isInDeliveries = task.deliveryDates?.some(deliveryDate =>
        formatDateToYMDInSaoPaulo(new Date(deliveryDate)) === dateString
      );

      return isScheduled || isInDeliveries;
    });
  };


  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else { // day
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const getDateLabel = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    } else if (viewMode === 'week') {
      return `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
    } else {
      return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const TaskBadge = ({ task }: { task: Task }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent': return 'bg-red-500';
        case 'complex': return 'bg-orange-500';
        default: return 'bg-blue-500';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed': return <CheckCircle className="h-3 w-3" />;
        case 'pending': return <Clock className="h-3 w-3" />;
        default: return <AlertTriangle className="h-3 w-3" />;
      }
    };

    return (
      <div
        className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 flex items-center gap-1 ${getPriorityColor(task.priority)}`}
        onClick={() => openTaskModal(task)}
        title={task.title}
      >
        {getStatusIcon(task.status)}
        <span className="truncate">{task.title}</span>
      </div>
    );
  };

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
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Controles de Navegação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {getDateLabel()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openTaskModal()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendário */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Cabeçalho dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Dias do mês */}
              {monthDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-2 border border-border cursor-pointer hover:bg-muted/50 transition-colors
                    ${!isSameMonth(day, currentDate) ? 'text-muted-foreground bg-muted/20' : ''}
                    ${isToday(day) ? 'bg-primary/10 border-primary' : ''}
                  `}
                >
                  <div className="font-medium text-sm mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {getTasksForDate(day).slice(0, 3).map((task) => (
                      <TaskBadge key={task.id} task={task} />
                    ))}
                    {getTasksForDate(day).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{getTasksForDate(day).length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="space-y-4">
              {/* Cabeçalho da semana */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="text-center p-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade de horários */}
              <div className="grid grid-cols-8 gap-1 text-sm">
                {/* Coluna de horários */}
                <div className="space-y-12">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="text-right pr-2 text-muted-foreground">
                      {String(8 + i).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>

                {/* Colunas dos dias */}
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="space-y-2">
                    {getTasksForDate(day).map((task) => (
                      <TaskBadge key={task.id} task={task} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Tarefas de {format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <Badge variant="secondary">
                  {getTasksForDate(currentDate).length} tarefa(s)
                </Badge>
              </div>

              <div className="space-y-3">
                {getTasksForDate(currentDate).length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhuma tarefa hoje
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Que tal adicionar uma nova tarefa para este dia?
                    </p>
                    <Button onClick={() => openTaskModal()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Tarefa
                    </Button>
                  </div>
                ) : (
                  getTasksForDate(currentDate).map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTaskModal(task)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={
                              task.priority === 'urgent' ? 'destructive' :
                                task.priority === 'complex' ? 'default' : 'secondary'
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;