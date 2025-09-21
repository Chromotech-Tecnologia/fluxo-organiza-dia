import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Download, Filter, CalendarIcon, FileSpreadsheet, Users, UserCheck, CheckSquare, Briefcase } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TableConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  fields: Array<{
    id: string;
    name: string;
    type: 'text' | 'date' | 'boolean' | 'number';
  }>;
}

const tableConfigs: TableConfig[] = [
  {
    id: 'profiles',
    name: 'Usuários',
    icon: <Users className="h-4 w-4" />,
    fields: [
      { id: 'id', name: 'ID', type: 'text' },
      { id: 'name', name: 'Nome', type: 'text' },
      { id: 'email', name: 'Email', type: 'text' },
      { id: 'welcome_shown', name: 'Boas-vindas exibidas', type: 'boolean' },
      { id: 'created_at', name: 'Data de criação', type: 'date' },
      { id: 'updated_at', name: 'Última atualização', type: 'date' },
    ]
  },
  {
    id: 'people',
    name: 'Pessoas',
    icon: <UserCheck className="h-4 w-4" />,
    fields: [
      { id: 'id', name: 'ID', type: 'text' },
      { id: 'name', name: 'Nome', type: 'text' },
      { id: 'role', name: 'Função', type: 'text' },
      { id: 'phone', name: 'Telefone', type: 'text' },
      { id: 'email', name: 'Email', type: 'text' },
      { id: 'department', name: 'Departamento', type: 'text' },
      { id: 'active', name: 'Ativo', type: 'boolean' },
      { id: 'notes', name: 'Observações', type: 'text' },
      { id: 'created_at', name: 'Data de criação', type: 'date' },
      { id: 'updated_at', name: 'Última atualização', type: 'date' },
    ]
  },
  {
    id: 'team_members',
    name: 'Membros da Equipe',
    icon: <Briefcase className="h-4 w-4" />,
    fields: [
      { id: 'id', name: 'ID', type: 'text' },
      { id: 'name', name: 'Nome', type: 'text' },
      { id: 'email', name: 'Email', type: 'text' },
      { id: 'phone', name: 'Telefone', type: 'text' },
      { id: 'role', name: 'Função', type: 'text' },
      { id: 'department', name: 'Departamento', type: 'text' },
      { id: 'status', name: 'Status', type: 'text' },
      { id: 'hire_date', name: 'Data de contratação', type: 'date' },
      { id: 'notes', name: 'Observações', type: 'text' },
      { id: 'created_at', name: 'Data de criação', type: 'date' },
      { id: 'updated_at', name: 'Última atualização', type: 'date' },
    ]
  },
  {
    id: 'tasks',
    name: 'Tarefas',
    icon: <CheckSquare className="h-4 w-4" />,
    fields: [
      { id: 'id', name: 'ID', type: 'text' },
      { id: 'title', name: 'Título', type: 'text' },
      { id: 'description', name: 'Descrição', type: 'text' },
      { id: 'type', name: 'Tipo', type: 'text' },
      { id: 'priority', name: 'Prioridade', type: 'text' },
      { id: 'time_investment', name: 'Tempo estimado', type: 'text' },
      { id: 'category', name: 'Categoria', type: 'text' },
      { id: 'status', name: 'Status', type: 'text' },
      { id: 'scheduled_date', name: 'Data agendada', type: 'date' },
      { id: 'is_concluded', name: 'Concluída', type: 'boolean' },
      { id: 'concluded_at', name: 'Data de conclusão', type: 'date' },
      { id: 'is_routine', name: 'É rotina', type: 'boolean' },
      { id: 'is_forwarded', name: 'Reagendada', type: 'boolean' },
      { id: 'forward_count', name: 'Qtd. reagendamentos', type: 'number' },
      { id: 'observations', name: 'Observações', type: 'text' },
      { id: 'created_at', name: 'Data de criação', type: 'date' },
      { id: 'updated_at', name: 'Última atualização', type: 'date' },
    ]
  },
  {
    id: 'skills',
    name: 'Habilidades',
    icon: <BarChart3 className="h-4 w-4" />,
    fields: [
      { id: 'id', name: 'ID', type: 'text' },
      { id: 'name', name: 'Nome', type: 'text' },
      { id: 'description', name: 'Descrição', type: 'text' },
      { id: 'category', name: 'Categoria', type: 'text' },
      { id: 'level', name: 'Nível', type: 'text' },
      { id: 'created_at', name: 'Data de criação', type: 'date' },
      { id: 'updated_at', name: 'Última atualização', type: 'date' },
    ]
  }
];

const ReportsPage = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const selectedTableConfig = tableConfigs.find(t => t.id === selectedTable);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    if (!selectedTableConfig) return;
    if (selectedFields.length === selectedTableConfig.fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(selectedTableConfig.fields.map(f => f.id));
    }
  };

  const handleExport = async () => {
    if (!selectedTable || selectedFields.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione uma tabela e pelo menos um campo para exportar.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-to-excel', {
        body: {
          table: selectedTable,
          fields: selectedFields,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });

      if (error) throw error;

      // Converter array de bytes de volta para Uint8Array
      const bytes = new Uint8Array(data.fileData);
      
      // Criar e baixar o arquivo Excel
      const blob = new Blob([bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: `Arquivo ${data.filename} exportado com ${data.recordCount} registros!`
      });

      setShowExportDialog(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Exportação e análise de dados do sistema
          </p>
        </div>
        <Button 
          onClick={() => setShowExportDialog(true)}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Exportar Dados para Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Tabela */}
            <div className="space-y-3">
              <label className="text-sm font-medium">1. Selecione a tabela:</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma tabela..." />
                </SelectTrigger>
                <SelectContent>
                  {tableConfigs.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      <div className="flex items-center gap-2">
                        {table.icon}
                        {table.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Seleção de Campos */}
            {selectedTableConfig && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">2. Selecione os campos:</label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedFields.length === selectedTableConfig.fields.length 
                      ? 'Desmarcar todos' 
                      : 'Selecionar todos'
                    }
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedTableConfig.fields.map(field => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <label
                        htmlFor={field.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.name}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                  ))}
                </div>

                {selectedFields.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedFields.length} campo(s) selecionado(s)
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Filtros de Data */}
            <div className="space-y-3">
              <label className="text-sm font-medium">3. Filtro de período (opcional):</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Data inicial:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Data final:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {(startDate || endDate) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>

              {startDate && endDate && (
                <div className="text-sm text-muted-foreground">
                  Período: {format(startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowExportDialog(false)}
                disabled={isExporting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleExport}
                disabled={!selectedTable || selectedFields.length === 0 || isExporting}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabelas disponíveis */}
      {!showExportDialog && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tableConfigs.map(table => (
            <Card key={table.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {table.icon}
                  <h3 className="font-medium">{table.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {table.fields.length} campos disponíveis
                </p>
                <div className="flex flex-wrap gap-1">
                  {table.fields.slice(0, 3).map(field => (
                    <Badge key={field.id} variant="outline" className="text-xs">
                      {field.name}
                    </Badge>
                  ))}
                  {table.fields.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{table.fields.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;