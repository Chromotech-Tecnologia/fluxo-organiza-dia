
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, ArrowRight, Clock } from "lucide-react";
import { Task } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskHistoryModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskHistoryModal({ task, isOpen, onClose }: TaskHistoryModalProps) {
  if (!task) return null;

  // Combinar todo o histórico e ordenar por data
  const allHistory = [
    // Histórico de conclusões
    ...(task.completionHistory || []).map(completion => ({
      type: 'completion' as const,
      date: completion.date,
      status: completion.status,
      completedAt: completion.completedAt,
      wasForwarded: completion.wasForwarded
    })),
    // Histórico de reagendamentos
    ...(task.forwardHistory || []).map(forward => ({
      type: 'forward' as const,
      date: forward.fromDate,
      toDate: forward.toDate,
      reason: forward.reason,
      forwardedAt: forward.forwardedAt
    }))
  ].sort((a, b) => {
    const dateA = a.type === 'completion' ? a.completedAt : a.forwardedAt;
    const dateB = b.type === 'completion' ? b.completedAt : b.forwardedAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'not-done':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Feito';
      case 'not-done':
        return 'Não Feito';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'not-done':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico da Tarefa: {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações gerais da tarefa */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Data Agendada:</span>
                  <p>{format(new Date(task.scheduledDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <span className="font-medium">Status Atual:</span>
                  <Badge className={`ml-2 ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Reagendamentos:</span>
                  <p>{task.forwardCount || 0}</p>
                </div>
                <div>
                  <span className="font-medium">Criada em:</span>
                  <p>{format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico cronológico */}
          <div className="space-y-3">
            <h3 className="font-medium">Histórico Cronológico</h3>
            
            {allHistory.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  Nenhum histórico encontrado para esta tarefa.
                </CardContent>
              </Card>
            ) : (
              allHistory.map((event, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {event.type === 'completion' ? (
                          getStatusIcon(event.status)
                        ) : (
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        {event.type === 'completion' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Baixa realizada</span>
                              <Badge className={getStatusColor(event.status)}>
                                {getStatusText(event.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Data da tarefa: {format(new Date(event.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              <p>Baixa em: {format(new Date(event.completedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                              {event.wasForwarded && (
                                <p className="text-orange-600">Esta baixa resultou em reagendamento</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Tarefa reagendada</span>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                Reagendamento
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>De: {format(new Date(event.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              <p>Para: {format(new Date(event.toDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              <p>Reagendado em: {format(new Date(event.forwardedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                              {event.reason && <p>Motivo: {event.reason}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
