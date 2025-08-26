
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Plus } from "lucide-react";

export function MeetingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Reuniões de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma reunião agendada
            </h3>
            <p className="text-muted-foreground mb-4">
              Você não tem reuniões para hoje
            </p>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Agendar Reunião
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
