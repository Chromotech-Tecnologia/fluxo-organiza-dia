
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Plus, Clock } from "lucide-react";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { useModalStore } from "@/stores/useModalStore";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { Task } from "@/types";

export function MeetingsCard() {
  const { tasks, loading } = useSupabaseTasks();
  const { openTaskModal } = useModalStore();
  
  // Filtrar tarefas do tipo reunião para hoje
  const todaysMeetings = tasks.filter(task => 
    task.type === 'meeting' && 
    task.scheduledDate === getCurrentDateInSaoPaulo()
  );

  const handleScheduleMeeting = () => {
    // Criar uma tarefa template para reunião
    const meetingTemplate: Partial<Task> = {
      type: 'meeting',
      scheduledDate: getCurrentDateInSaoPaulo(),
      priority: 'none',
      timeInvestment: 'medium',
      category: 'business'
    };
    
    openTaskModal(meetingTemplate as Task);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200';
      case 'priority': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeInvestmentLabel = (timeInvestment: string) => {
    switch (timeInvestment) {
      case 'custom-5': return '5min';
      case 'custom-30': return '30min';
      case 'low': return '1h';
      case 'medium': return '2h';
      case 'high': return '4h';
      case 'custom-4h': return '4h';
      case 'custom-8h': return '8h';
      default: return timeInvestment;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reuniões de Hoje
          </div>
          <Badge variant="secondary">{todaysMeetings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando reuniões...</p>
            </div>
          ) : todaysMeetings.length > 0 ? (
            <>
              {todaysMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{meeting.title}</h4>
                      {meeting.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {getTimeInvestmentLabel(meeting.timeInvestment)}
                          </span>
                        </div>
                        {meeting.priority !== 'none' && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(meeting.priority)}`}
                          >
                            {meeting.priority === 'extreme' ? 'Urgente' : 'Prioridade'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleScheduleMeeting}
                >
                  <Plus className="h-4 w-4" />
                  Agendar Nova Reunião
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma reunião agendada
              </h3>
              <p className="text-muted-foreground mb-4">
                Você não tem reuniões para hoje
              </p>
              <Button size="sm" className="gap-2" onClick={handleScheduleMeeting}>
                <Plus className="h-4 w-4" />
                Agendar Reunião
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
