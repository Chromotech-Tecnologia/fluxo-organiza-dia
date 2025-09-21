import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Database, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ExportFormat = 'sql' | 'excel' | 'csv';

const formatOptions = [
  {
    value: 'sql' as ExportFormat,
    label: 'SQL Dump',
    description: 'Arquivo .sql com estrutura e dados completos',
    icon: <Database className="h-4 w-4" />,
    extension: '.sql'
  },
  {
    value: 'excel' as ExportFormat,
    label: 'Excel',
    description: 'Planilha Excel com todas as tabelas separadas',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    extension: '.xlsx'
  },
  {
    value: 'csv' as ExportFormat,
    label: 'CSV',
    description: 'Arquivos CSV compactados em ZIP',
    icon: <FileBarChart className="h-4 w-4" />,
    extension: '.zip'
  }
];

const BackupPage = () => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('sql');
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  const selectedFormatOption = formatOptions.find(f => f.value === selectedFormat);

  const handleExportDatabase = async () => {
    if (!selectedFormat) {
      toast({
        title: "Erro",
        description: "Selecione um formato para exportação.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-database', {
        body: {
          format: selectedFormat
        }
      });

      if (error) throw error;

      // Converter array de bytes de volta para Uint8Array
      const bytes = new Uint8Array(data.fileData);
      
      // Criar e baixar o arquivo
      const mimeTypes = {
        sql: 'application/sql',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'application/zip'
      };
      
      const blob = new Blob([bytes], { type: mimeTypes[selectedFormat] });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date());
      
      toast({
        title: "Sucesso",
        description: `Backup exportado com sucesso! Arquivo: ${data.filename}`
      });

    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar backup. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Backup do Sistema</h1>
        <p className="text-muted-foreground">
          Faça o download completo de todos os seus dados
        </p>
      </div>

      {/* Exportação do Banco Completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Exportar Banco de Dados Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              Baixe todos os dados do seu sistema em diferentes formatos. Inclui todas as tabelas: 
              usuários, tarefas, pessoas, equipes, habilidades e configurações.
            </p>
            
            {lastBackup && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  Último backup: {lastBackup.toLocaleString('pt-BR')}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Seleção de Formato */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Selecione o formato de exportação:
              </label>
              
              <div className="grid gap-4 md:grid-cols-3">
                {formatOptions.map((option) => (
                  <Card 
                    key={option.value} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedFormat === option.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFormat(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedFormat === option.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{option.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {option.extension}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detalhes do Formato Selecionado */}
            {selectedFormatOption && (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  {selectedFormatOption.icon}
                  <span className="font-medium">{selectedFormatOption.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFormatOption.description}
                </p>
                
                {selectedFormat === 'sql' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Inclui estrutura das tabelas (CREATE TABLE)
                    <br />
                    • Dados completos (INSERT statements)
                    <br />
                    • Compatível com PostgreSQL
                  </div>
                )}
                
                {selectedFormat === 'excel' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Uma aba para cada tabela
                    <br />
                    • Cabeçalhos em português
                    <br />
                    • Formatação automática de dados
                  </div>
                )}
                
                {selectedFormat === 'csv' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Um arquivo CSV por tabela
                    <br />
                    • Compactado em arquivo ZIP
                    <br />
                    • Codificação UTF-8
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Botão de Exportação */}
          <div className="flex justify-end">
            <Button 
              onClick={handleExportDatabase}
              disabled={isExporting}
              className="gap-2 min-w-[160px]"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar {selectedFormatOption?.label}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Importantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">🔒 Segurança dos Dados</h4>
              <p className="text-sm text-muted-foreground">
                Os backups contêm apenas os seus dados pessoais. Senhas e informações sensíveis são excluídas automaticamente.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">📊 Dados Incluídos</h4>
              <p className="text-sm text-muted-foreground">
                • Todas as tarefas e seus detalhes<br />
                • Pessoas e membros da equipe<br />
                • Habilidades cadastradas<br />
                • Configurações do perfil<br />
                • Relatórios e estatísticas
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">💾 Como Usar o Backup</h4>
              <p className="text-sm text-muted-foreground">
                Use os arquivos para análises externas, migração de dados ou como backup de segurança. 
                Arquivos SQL podem ser restaurados em outras instâncias PostgreSQL.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupPage;