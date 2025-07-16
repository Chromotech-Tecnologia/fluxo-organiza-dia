import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText } from "lucide-react";

const BackupPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Backup e Restore</h1>
        <p className="text-muted-foreground">
          Gerencie backups dos seus dados
        </p>
      </div>

      {/* Ações de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Baixe um backup completo de todas as suas tarefas, pessoas e relatórios
            </p>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Restaure dados de um arquivo de backup anterior
            </p>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum backup encontrado
            </h3>
            <p className="text-muted-foreground">
              Histórico de backups será exibido aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupPage;