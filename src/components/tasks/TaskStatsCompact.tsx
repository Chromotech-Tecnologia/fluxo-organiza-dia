
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { Calendar, Clock, CheckCircle, ArrowRight, Target, Users } from "lucide-react";
import { calculateTotalEstimatedTime, formatTime } from "@/lib/taskUtils";

interface TaskStatsCompactProps {
  tasks: Task[];
}

export function TaskStatsCompact({ tasks }: TaskStatsCompactProps) {
  // Estatísticas básicas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => {
    const lastCompletion = t.completionHistory?.[t.completionHistory.length - 1];
    return lastCompletion?.status === 'completed' || t.isConcluded;
  }).length;
  const notDoneTasks = tasks.filter(t => {
    const lastCompletion = t.completionHistory?.[t.completionHistory.length - 1];
    return lastCompletion?.status === 'not-done';
  }).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' && !t.isConcluded).length;

  // Reagendamentos
  const forwardedTasks = tasks.filter(t => t.forwardCount > 0).length;
  const notForwardedTasks = totalTasks - forwardedTasks;

  // Conclusões definitivas
  const concludedTasks = tasks.filter(t => t.isConcluded).length;
  const notConcludedTasks = totalTasks - concludedTasks;

  // Tipos específicos
  const meetingTasks = tasks.filter(t => t.type === 'meeting').length;
  const delegatedTasks = tasks.filter(t => t.type === 'delegated-task').length;

  // Tempo estimado
  const totalEstimatedTime = calculateTotalEstimatedTime(tasks);

  const StatCard = ({ icon, title, stats, color }: {
    icon: React.ReactNode;
    title: string;
    stats: Array<{ label: string; value: number; accent?: string }>;
    color: string;
  }) => (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-lg font-bold ${stat.accent || ''}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status das Tarefas */}
      <StatCard
        icon={<Target className="h-4 w-4 text-blue-500" />}
        title="Status das Tarefas"
        color="border-l-blue-500"
        stats={[
          { label: 'Total', value: totalTasks },
          { label: 'Feitas', value: completedTasks, accent: 'text-green-600' },
          { label: 'Não Feitas', value: notDoneTasks, accent: 'text-red-600' },
          { label: 'Pendentes', value: pendingTasks, accent: 'text-yellow-600' }
        ]}
      />

      {/* Reagendamentos */}
      <StatCard
        icon={<ArrowRight className="h-4 w-4 text-orange-500" />}
        title="Reagendamentos"
        color="border-l-orange-500"
        stats={[
          { label: 'Reagendadas', value: forwardedTasks, accent: 'text-orange-600' },
          { label: 'Não Reagendadas', value: notForwardedTasks },
          { label: 'Concluídas', value: concludedTasks, accent: 'text-green-600' },
          { label: 'Não Concluídas', value: notConcludedTasks }
        ]}
      />

      {/* Tipos Específicos */}
      <StatCard
        icon={<Users className="h-4 w-4 text-purple-500" />}
        title="Tipos de Tarefas"
        color="border-l-purple-500"
        stats={[
          { label: 'Reuniões', value: meetingTasks, accent: 'text-blue-600' },
          { label: 'Delegadas', value: delegatedTasks, accent: 'text-purple-600' },
          { label: 'Outras', value: totalTasks - meetingTasks - delegatedTasks },
          { label: 'Total', value: totalTasks }
        ]}
      />

      {/* Tempo Estimado */}
      <StatCard
        icon={<Clock className="h-4 w-4 text-green-500" />}
        title="Tempo Estimado"
        color="border-l-green-500"
        stats={[
          { label: 'Total', value: totalEstimatedTime, accent: 'text-green-600' },
          { label: 'Média/Tarefa', value: totalTasks > 0 ? Math.round(totalEstimatedTime / totalTasks) : 0 },
          { label: 'Formato', value: 0 }, // Placeholder para manter layout
          { label: formatTime(totalEstimatedTime), value: 0 } // Usando label para mostrar tempo formatado
        ].filter((_, index) => index < 3).concat([
          { label: formatTime(totalEstimatedTime), value: totalTasks > 0 ? Math.round(totalEstimatedTime / totalTasks) : 0 }
        ])}
      />
    </div>
  );
}
