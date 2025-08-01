import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  User, 
  CheckCircle, 
  Circle, 
  X, 
  MoreHorizontal,
  Calendar,
  MessageSquare,
  ArrowRight,
  History,
  Edit
} from "lucide-react";
import { Task } from "@/types";
import { usePeople } from "@/hooks/usePeople";
import { useModalStore } from "@/stores/useModalStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: Task['status']) => void;
  onForward?: () => void;
}

export function TaskCard({ task, onStatusChange, onForward }: TaskCardProps) {
  const { people, getPersonById } = usePeople();
  const { openTaskModal, openDeleteModal, openForwardTaskModal } = useModalStore();
  const assignedPerson = task.assignedPersonId ? getPersonById(task.assignedPersonId) : null;
  
  const completedSubItems = task.subItems.filter(item => item.completed).length;
  const totalSubItems = task.subItems.length;
  const progressPercentage = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

  // Verificar se já tem uma baixa de feito/não feito
  const hasCompletion = task.completionHistory && task.completionHistory.length > 0;
  const lastCompletion = hasCompletion ? task.completionHistory[task.completionHistory.length - 1] : null;
  const canMarkDone = !hasCompletion || (lastCompletion?.status === 'not-done');
  const canMarkNotDone = !hasCompletion || (lastCompletion?.status === 'completed');

  const typeColors = {
    'meeting': 'bg-blue-100 text-blue-800 border-blue-200',
    'own-task': 'bg-green-100 text-green-800 border-green-200',
    'delegated-task': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const priorityColors = {
    'simple': 'bg-gray-100 text-gray-800 border-gray-200',
    'urgent': 'bg-red-100 text-red-800 border-red-200',
    'complex': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const statusColors = {
    'pending': 'border-l-yellow-500',
    'completed': 'border-l-green-500',
    'not-done': 'border-l-red-500',
    'forwarded-date': 'border-l-blue-500',
    'forwarded-person': 'border-l-purple-500'
  };

  const getTypeLabel = (type: Task['type']) => {
    const labels = {
      'meeting': 'Reunião',
      'own-task': 'Própria',
      'delegated-task': 'Repassada'
    };
    return labels[type];
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    const labels = {
      'simple': 'Simples',
      'urgent': 'Urgente',
      'complex': 'Complexa'
    };
    return labels[priority];
  };

  const getStatusLabel = (status: Task['status']) => {
    const labels = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'not-done': 'Não Feita',
      'forwarded-date': 'Repassada (Data)',
      'forwarded-person': 'Repassada (Pessoa)'
    };
    return labels[status];
  };

  return (
    <Card className={cn("w-full border-l-4 hover:shadow-md transition-shadow", statusColors[task.status])}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1 mb-2 text-sm">
              {task.title}
            </h3>
            <div className="flex items-center gap-1 flex-wrap">
              <Badge className={cn(typeColors[task.type], "text-xs py-0 px-2")}>
                {getTypeLabel(task.type)}
              </Badge>
              <Badge className={cn(priorityColors[task.priority], "text-xs py-0 px-2")}>
                {getPriorityLabel(task.priority)}
              </Badge>
              {task.forwardCount > 0 && (
                <Badge variant="secondary" className="text-xs py-0 px-2">
                  {task.forwardCount}x
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <History className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Histórico da Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  
                  <Separator />
                  
                  {/* Histórico de Conclusões */}
                  {task.completionHistory && task.completionHistory.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Histórico de Conclusões:</h5>
                      <div className="space-y-1">
                        {task.completionHistory.map((completion, index) => (
                          <div key={index} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                            {format(new Date(completion.completedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} - 
                            <span className={completion.status === 'completed' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {completion.status === 'completed' ? ' Feito' : ' Não feito'}
                            </span>
                            {completion.wasForwarded && ' (repassada após conclusão)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.completionHistory && task.completionHistory.length > 0 && task.forwardHistory && task.forwardHistory.length > 0 && (
                    <Separator />
                  )}

                  {/* Histórico de Repasses */}
                  {task.forwardHistory && task.forwardHistory.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Histórico de Repasses ({task.forwardCount}x):</h5>
                      <div className="space-y-1">
                        {task.forwardHistory.map((forward, index) => (
                          <div key={index} className="text-xs border-l-2 border-yellow-200 pl-3 py-1">
                            {format(new Date(forward.forwardedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} - 
                            <span className="text-yellow-600 font-medium"> Repassada</span>
                            <div className="ml-2 text-xs text-muted-foreground mt-1">
                              De: {forward.originalDate} para: {forward.newDate}
                              {forward.statusAtForward && (
                                <span className="ml-2">
                                  (Status: <span className={
                                    forward.statusAtForward === 'completed' ? 'text-green-600' : 
                                    forward.statusAtForward === 'not-done' ? 'text-red-600' : 
                                    'text-yellow-600'
                                  }>
                                    {forward.statusAtForward === 'completed' ? 'Feito' : 
                                     forward.statusAtForward === 'not-done' ? 'Não feito' : 
                                     'Pendente'}
                                  </span>)
                                </span>
                              )}
                              {forward.forwardedTo && (
                                <div className="text-xs">
                                  Para: {people.find(p => p.id === forward.forwardedTo)?.name || 'Equipe'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="sm" onClick={() => openDeleteModal('task', task)} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-3">
        {/* Informações básicas */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          {assignedPerson && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{assignedPerson.name}</span>
            </div>
          )}
        </div>

        {/* Progresso dos Subitens */}
        {totalSubItems > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-muted-foreground">{completedSubItems}/{totalSubItems}</span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        )}

        {/* Ações compactas */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => onStatusChange?.('completed')}
              disabled={!canMarkDone}
              variant={lastCompletion?.status === 'completed' ? "default" : "outline"}
              className={cn(
                "h-7 px-2 text-xs",
                lastCompletion?.status === 'completed' 
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                  : canMarkDone 
                    ? "border-green-500 text-green-700 hover:bg-green-50" 
                    : "opacity-50"
              )}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Feito
            </Button>
            
            <Button
              size="sm"
              onClick={() => onStatusChange?.('not-done')}
              disabled={!canMarkNotDone}
              variant={lastCompletion?.status === 'not-done' ? "default" : "outline"}
              className={cn(
                "h-7 px-2 text-xs",
                lastCompletion?.status === 'not-done' 
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                  : canMarkNotDone 
                    ? "border-red-500 text-red-700 hover:bg-red-50" 
                    : "opacity-50"
              )}
            >
              <X className="h-3 w-3 mr-1" />
              Não feito
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => openForwardTaskModal(task)}
              variant="outline"
              className="h-7 px-2 text-xs border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Repassar
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => openTaskModal(task)} 
              className="h-7 px-2 text-xs"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}