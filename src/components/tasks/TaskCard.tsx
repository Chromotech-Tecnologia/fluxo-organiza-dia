import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  User, 
  CheckCircle, 
  Circle, 
  X, 
  MoreHorizontal,
  Calendar,
  MessageSquare,
  ArrowRight
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

  const handleEdit = () => {
    openTaskModal(task);
  };

  const handleDelete = () => {
    openDeleteModal('task', task);
  };
  
  const completedSubItems = task.subItems.filter(item => item.completed).length;
  const totalSubItems = task.subItems.length;
  const progressPercentage = totalSubItems > 0 ? (completedSubItems / totalSubItems) * 100 : 0;

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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={typeColors[task.type]}>
                {getTypeLabel(task.type)}
              </Badge>
              <Badge className={priorityColors[task.priority]}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Badge variant="outline">
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {task.forwardCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {task.forwardCount}x
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Pessoa Responsável */}
        {assignedPerson && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Equipe: {assignedPerson.name} - {assignedPerson.role}
            </span>
          </div>
        )}
        
        {/* Histórico de Repasses */}
        {task.forwardCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Repassada {task.forwardCount}x 
              {task.forwardHistory.length > 0 && task.forwardHistory[task.forwardHistory.length - 1].forwardedTo && 
                ` para ${people.find(p => p.id === task.forwardHistory[task.forwardHistory.length - 1].forwardedTo)?.name || 'Equipe'}`
              }
            </span>
          </div>
        )}

        {/* Data */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {format(new Date(task.scheduledDate), "PPP", { locale: ptBR })}
          </span>
        </div>

        {/* Progresso dos Subitens */}
        {totalSubItems > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-muted-foreground">
                {completedSubItems}/{totalSubItems}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Observações */}
        {task.observations && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.observations}
            </p>
          </div>
        )}

        {/* Histórico de Conclusões */}
        {task.completionHistory && task.completionHistory.length > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <strong>Histórico de Conclusões:</strong>
            {task.completionHistory.map((completion, index) => (
              <div key={index} className="ml-2 mt-1">
                • {format(new Date(completion.completedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} - 
                <span className={completion.status === 'completed' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {completion.status === 'completed' ? ' Feito' : ' Não feito'}
                </span>
                {completion.wasForwarded && ' (repassada após conclusão)'}
              </div>
            ))}
          </div>
        )}

        {/* Histórico de Repasses */}
        {task.forwardHistory && task.forwardHistory.length > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
            <strong>Histórico de Repasses ({task.forwardCount}x):</strong>
            {task.forwardHistory.map((forward, index) => (
              <div key={index} className="ml-2 mt-1">
                • {format(new Date(forward.forwardedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} - 
                <span className="text-yellow-600 font-medium"> Repassada</span>
                <div className="ml-4 text-xs">
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
        )}

        {/* Ações */}
        <div className="flex flex-col gap-2 pt-3 border-t">
          {/* Ações principais: Feito/Não feito */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onStatusChange?.('completed')}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Feito
            </Button>
            <Button
              size="sm"
              onClick={() => onStatusChange?.('not-done')}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Não feito
            </Button>
          </div>
          
          {/* Ação secundária: Repassar (sempre disponível) */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => openForwardTaskModal(task)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Repassar
            </Button>
            <Button size="sm" variant="outline" onClick={handleEdit} className="flex-1">
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}