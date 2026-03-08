import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Task } from "@/types";
import { CheckCircle, RotateCcw, User, Timer, ChevronDown } from "lucide-react";
import { getTimeInMinutes, formatTime } from "@/lib/taskUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskStatsCompactProps {
  tasks: Task[];
}

function useTaskStats(tasks: Task[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const notDoneTasks = tasks.filter(task => task.completionHistory?.some(completion => completion.status === 'not-done')).length;
  const definitiveTasks = tasks.filter(task => {
    if (task.status !== 'completed') return false;
    const wasRescheduledFromThisDate = task.forwardHistory && task.forwardHistory.length > 0 && task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
    return !wasRescheduledFromThisDate;
  }).length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  const rescheduledTasks = tasks.filter(task => {
    if (!task.forwardHistory || task.forwardHistory.length === 0) return false;
    return task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
  }).length;
  const notRescheduledTasks = tasks.filter(task => {
    if (!task.forwardHistory || task.forwardHistory.length === 0) return true;
    return !task.forwardHistory.some(forward => forward.originalDate === task.scheduledDate);
  }).length;
  const totalConcludedTasks = tasks.filter(task => task.isConcluded === true).length;
  const totalNotConcludedTasks = tasks.filter(task => task.isConcluded !== true).length;

  const personalTasks = tasks.filter(task => task.category === 'personal').length;
  const meetingTasks = tasks.filter(task => task.type === 'meeting').length;
  const delegatedTasks = tasks.filter(task => task.type === 'delegated-task').length;
  const professionalTasks = tasks.filter(task => task.category !== 'personal').length;

  const totalEstimatedMinutes = tasks.reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const completedEstimatedMinutes = tasks.filter(task => task.status === 'completed').reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const notDoneEstimatedMinutes = tasks.filter(task => task.completionHistory?.some(completion => completion.status === 'not-done')).reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);
  const pendingEstimatedMinutes = tasks.filter(task => task.status === 'pending').reduce((total, task) => total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes), 0);

  const calculatePercentage = (value: number) => totalTasks > 0 ? Math.round(value / totalTasks * 100) : 0;

  return {
    totalTasks, completedTasks, notDoneTasks, definitiveTasks, pendingTasks,
    rescheduledTasks, notRescheduledTasks, totalConcludedTasks, totalNotConcludedTasks,
    personalTasks, meetingTasks, delegatedTasks, professionalTasks,
    totalEstimatedMinutes, completedEstimatedMinutes, notDoneEstimatedMinutes, pendingEstimatedMinutes,
    calculatePercentage
  };
}

export function TaskStatsCompact({ tasks }: TaskStatsCompactProps) {
  const isMobile = useIsMobile();
  const stats = useTaskStats(tasks);
  const { calculatePercentage: pct } = stats;

  // ===== MOBILE: Dropdown-style collapsibles =====
  if (isMobile) {
    const sections = [
      {
        icon: <User className="h-4 w-4 text-purple-500" />,
        label: 'Tipos',
        summary: `${stats.totalTasks} tarefas`,
        borderColor: 'border-l-purple-500',
        content: (
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-zinc-600">Pessoais</span><span className="text-sm font-medium text-gray-600">{stats.personalTasks} ({pct(stats.personalTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-orange-600">Reuniões</span><span className="text-sm font-medium text-orange-600">{stats.meetingTasks} ({pct(stats.meetingTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-fuchsia-900">Delegadas</span><span className="text-sm font-medium text-fuchsia-900">{stats.delegatedTasks} ({pct(stats.delegatedTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-blue-600">Profissional</span><span className="text-sm font-medium text-blue-600">{stats.professionalTasks} ({pct(stats.professionalTasks)}%)</span></div>
          </div>
        )
      },
      {
        icon: <Timer className="h-4 w-4 text-indigo-500" />,
        label: 'Tempo',
        summary: formatTime(stats.totalEstimatedMinutes),
        borderColor: 'border-l-indigo-500',
        content: (
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-indigo-600">Total</span><span className="text-sm font-medium text-indigo-600">{formatTime(stats.totalEstimatedMinutes)}</span></div>
            <div className="flex justify-between"><span className="text-xs text-green-600">Feitas</span><span className="text-sm font-medium text-green-600">{formatTime(stats.completedEstimatedMinutes)}</span></div>
            <div className="flex justify-between"><span className="text-xs text-red-600">Não Feitas</span><span className="text-sm font-medium text-red-600">{formatTime(stats.notDoneEstimatedMinutes)}</span></div>
            <div className="flex justify-between"><span className="text-xs text-yellow-600">Pendentes</span><span className="text-sm font-medium text-yellow-600">{formatTime(stats.pendingEstimatedMinutes)}</span></div>
          </div>
        )
      },
      {
        icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
        label: 'Status',
        summary: `${stats.completedTasks}/${stats.totalTasks} feitas`,
        borderColor: 'border-l-blue-500',
        content: (
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-blue-600">Total</span><span className="text-sm font-medium text-blue-600">{stats.totalTasks} (100%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-green-600">Feitas</span><span className="text-sm font-medium text-green-600">{stats.completedTasks} ({pct(stats.completedTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-blue-900">Definitivo</span><span className="text-sm font-medium text-blue-900">{stats.definitiveTasks} ({pct(stats.definitiveTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-red-600">Não Feitas</span><span className="text-sm font-medium text-red-600">{stats.notDoneTasks} ({pct(stats.notDoneTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-yellow-600">Pendentes</span><span className="text-sm font-medium text-yellow-600">{stats.pendingTasks} ({pct(stats.pendingTasks)}%)</span></div>
          </div>
        )
      },
      {
        icon: <RotateCcw className="h-4 w-4 text-orange-500" />,
        label: 'Reagendamentos',
        summary: `${stats.rescheduledTasks} reag.`,
        borderColor: 'border-l-orange-500',
        content: (
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-gray-600">Não Reagendadas</span><span className="text-sm font-medium text-gray-600">{stats.notRescheduledTasks} ({pct(stats.notRescheduledTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-orange-600">Reagendadas</span><span className="text-sm font-medium text-orange-600">{stats.rescheduledTasks} ({pct(stats.rescheduledTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-green-600">Concluídas</span><span className="text-sm font-medium text-green-600">{stats.totalConcludedTasks} ({pct(stats.totalConcludedTasks)}%)</span></div>
            <div className="flex justify-between"><span className="text-xs text-red-600">Não Concluídas</span><span className="text-sm font-medium text-red-600">{stats.totalNotConcludedTasks} ({pct(stats.totalNotConcludedTasks)}%)</span></div>
          </div>
        )
      }
    ];

    return (
      <div className="space-y-2">
        {sections.map((section, idx) => (
          <Collapsible key={idx}>
            <div className={`border rounded-lg ${section.borderColor} border-l-4`}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium">{section.label}</span>
                  <span className="text-xs text-muted-foreground">{section.summary}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                {section.content}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    );
  }

  // ===== DESKTOP: Grid (unchanged) =====
  return <div className="grid grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Status das Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs text-blue-600">Total</span><span className="text-sm font-medium text-blue-600">{stats.totalTasks} (100%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-green-600">Feitas</span><span className="text-sm font-medium text-green-600">{stats.completedTasks} ({pct(stats.completedTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-blue-900">Definitivo</span><span className="text-sm font-medium text-blue-900">{stats.definitiveTasks} ({pct(stats.definitiveTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-red-600">Não Feitas</span><span className="text-sm font-medium text-red-600">{stats.notDoneTasks} ({pct(stats.notDoneTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-yellow-600">Pendentes</span><span className="text-sm font-medium text-yellow-600">{stats.pendingTasks} ({pct(stats.pendingTasks)}%)</span></div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <RotateCcw className="h-4 w-4" />
            Reagendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Não Reagendadas</span><span className="text-sm font-medium text-gray-600">{stats.notRescheduledTasks} ({pct(stats.notRescheduledTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-orange-600">Reagendadas</span><span className="text-sm font-medium text-orange-600">{stats.rescheduledTasks} ({pct(stats.rescheduledTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-green-600">Concluídas</span><span className="text-sm font-medium text-green-600">{stats.totalConcludedTasks} ({pct(stats.totalConcludedTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-red-600">Não Concluídas</span><span className="text-sm font-medium text-red-600">{stats.totalNotConcludedTasks} ({pct(stats.totalNotConcludedTasks)}%)</span></div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <User className="h-4 w-4" />
            Tipos de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs text-zinc-600">Pessoais</span><span className="text-sm font-medium text-gray-600">{stats.personalTasks} ({pct(stats.personalTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-orange-600">Reuniões</span><span className="text-sm font-medium text-orange-600">{stats.meetingTasks} ({pct(stats.meetingTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-fuchsia-900">Delegadas</span><span className="text-sm font-medium text-fuchsia-900">{stats.delegatedTasks} ({pct(stats.delegatedTasks)}%)</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-blue-600">Profissional</span><span className="text-sm font-medium text-blue-600">{stats.professionalTasks} ({pct(stats.professionalTasks)}%)</span></div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Timer className="h-4 w-4" />
            Tempo Estimado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center"><span className="text-xs text-indigo-600">Total</span><span className="text-sm font-medium text-indigo-600">{formatTime(stats.totalEstimatedMinutes)}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-green-600">Feitas</span><span className="text-sm font-medium text-green-600">{formatTime(stats.completedEstimatedMinutes)}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-red-600">Não Feitas</span><span className="text-sm font-medium text-red-600">{formatTime(stats.notDoneEstimatedMinutes)}</span></div>
          <div className="flex justify-between items-center"><span className="text-xs text-yellow-600">Pendentes</span><span className="text-sm font-medium text-yellow-600">{formatTime(stats.pendingEstimatedMinutes)}</span></div>
        </CardContent>
      </Card>
    </div>;
}
