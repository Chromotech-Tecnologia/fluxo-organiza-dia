import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const StatsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estatísticas</h1>
        <p className="text-muted-foreground">
          Métricas detalhadas de produtividade
        </p>
      </div>

      {/* Conteúdo das Estatísticas */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Estatísticas Avançadas
            </h3>
            <p className="text-muted-foreground">
              Análises estatísticas em desenvolvimento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsPage;