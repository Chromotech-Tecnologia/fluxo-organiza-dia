import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";

const DailyClosePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fechamento Diário</h1>
          <p className="text-muted-foreground">
            Revise e feche o dia de trabalho
          </p>
        </div>
        <Button className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Fechar Dia
        </Button>
      </div>

      {/* Conteúdo do Fechamento */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Fechamento Diário
            </h3>
            <p className="text-muted-foreground">
              Interface de fechamento em desenvolvimento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyClosePage;