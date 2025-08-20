
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TaskFilter, TaskPriority, TaskStatus, TaskType } from "@/types";
import { useEffect, useState } from "react";
import { PeopleSelect } from "../people/PeopleSelect";
import { Badge } from "@/components/ui/badge";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>(currentFilters.type || []);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>(currentFilters.priority || []);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>(currentFilters.status || []);
  const [assignedPersonId, setAssignedPersonId] = useState<string | undefined>(currentFilters.assignedPersonId);

  const today = getCurrentDateInSaoPaulo();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleDateQuickSelect = (dateType: 'hoje' | 'ontem' | 'amanha') => {
    let date = today;
    if (dateType === 'ontem') date = yesterday;
    if (dateType === 'amanha') date = tomorrow;
    
    onFiltersChange({
      ...currentFilters,
      dateRange: { start: date, end: date }
    });
  };

  const handleDateChange = (start: string, end: string) => {
    onFiltersChange({
      ...currentFilters,
      dateRange: { start, end }
    });
  };

  const handleTypeToggle = (type: TaskType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newTypes);
    onFiltersChange({
      ...currentFilters,
      type: newTypes
    });
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    setSelectedPriorities(newPriorities);
    onFiltersChange({
      ...currentFilters,
      priority: newPriorities
    });
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(newStatuses);
    onFiltersChange({
      ...currentFilters,
      status: newStatuses
    });
  };

  const handleAssignedPersonChange = (personId: string | undefined) => {
    setAssignedPersonId(personId);
    onFiltersChange({
      ...currentFilters,
      assignedPersonId: personId
    });
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setAssignedPersonId(undefined);
    onFiltersChange({
      dateRange: {
        start: today,
        end: today
      }
    });
  };

  const formatDateBrazilian = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  useEffect(() => {
    setSelectedTypes(currentFilters.type || []);
    setSelectedPriorities(currentFilters.priority || []);
    setSelectedStatuses(currentFilters.status || []);
    setAssignedPersonId(currentFilters.assignedPersonId);
  }, [currentFilters]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <Badge variant="secondary">
            {selectedTypes.length + selectedPriorities.length + selectedStatuses.length + (assignedPersonId ? 1 : 0)} ativos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Data</Label>
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant={currentFilters.dateRange?.start === today && currentFilters.dateRange?.end === today ? "default" : "outline"}
              onClick={() => handleDateQuickSelect('hoje')}
            >
              Hoje
            </Button>
            <Button 
              size="sm" 
              variant={currentFilters.dateRange?.start === yesterday && currentFilters.dateRange?.end === yesterday ? "default" : "outline"}
              onClick={() => handleDateQuickSelect('ontem')}
            >
              Ontem
            </Button>
            <Button 
              size="sm" 
              variant={currentFilters.dateRange?.start === tomorrow && currentFilters.dateRange?.end === tomorrow ? "default" : "outline"}
              onClick={() => handleDateQuickSelect('amanha')}
            >
              Amanhã
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">De</Label>
              <Input
                type="date"
                value={currentFilters.dateRange?.start || today}
                onChange={(e) => handleDateChange(e.target.value, currentFilters.dateRange?.end || e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Até</Label>
              <Input
                type="date"
                value={currentFilters.dateRange?.end || today}
                onChange={(e) => handleDateChange(currentFilters.dateRange?.start || e.target.value, e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          {currentFilters.dateRange && (
            <p className="text-xs text-muted-foreground">
              {formatDateBrazilian(currentFilters.dateRange.start)} - {formatDateBrazilian(currentFilters.dateRange.end)}
            </p>
          )}
        </div>

        {/* Tipo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedTypes.includes('meeting') ? "default" : "outline"}
              onClick={() => handleTypeToggle('meeting')}
            >
              Reunião
            </Button>
            <Button
              size="sm"
              variant={selectedTypes.includes('own-task') ? "default" : "outline"}
              onClick={() => handleTypeToggle('own-task')}
            >
              Própria
            </Button>
            <Button
              size="sm"
              variant={selectedTypes.includes('delegated-task') ? "default" : "outline"}
              onClick={() => handleTypeToggle('delegated-task')}
            >
              Delegada
            </Button>
          </div>
        </div>

        {/* Prioridade */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prioridade</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedPriorities.includes('none') ? "default" : "outline"}
              onClick={() => handlePriorityToggle('none')}
            >
              Sem Prioridade
            </Button>
            <Button
              size="sm"
              variant={selectedPriorities.includes('priority') ? "default" : "outline"}
              onClick={() => handlePriorityToggle('priority')}
            >
              Prioridade
            </Button>
            <Button
              size="sm"
              variant={selectedPriorities.includes('extreme') ? "default" : "outline"}
              onClick={() => handlePriorityToggle('extreme')}
            >
              Extrema
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedStatuses.includes('pending') ? "default" : "outline"}
              onClick={() => handleStatusToggle('pending')}
            >
              Pendente
            </Button>
            <Button
              size="sm"
              variant={selectedStatuses.includes('completed') ? "default" : "outline"}
              onClick={() => handleStatusToggle('completed')}
            >
              Feito
            </Button>
            <Button
              size="sm"
              variant={selectedStatuses.includes('not-done') ? "default" : "outline"}
              onClick={() => handleStatusToggle('not-done')}
            >
              Não Feito
            </Button>
            <Button
              size="sm"
              variant={selectedStatuses.includes('forwarded-date') ? "default" : "outline"}
              onClick={() => handleStatusToggle('forwarded-date')}
            >
              Repassada
            </Button>
          </div>
        </div>

        {/* Pessoa */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Pessoa Designada</Label>
          <PeopleSelect
            value={assignedPersonId}
            onChange={handleAssignedPersonChange}
            placeholder="Todas as Pessoas"
          />
        </div>

        {/* Estado da Tarefa */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Estado</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isConcluded"
                checked={currentFilters.isConcluded || false}
                onCheckedChange={(checked) => 
                  onFiltersChange({
                    ...currentFilters,
                    isConcluded: checked as boolean
                  })
                }
              />
              <label htmlFor="isConcluded" className="text-sm">Concluídas</label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notConcluded"
                checked={currentFilters.notConcluded || false}
                onCheckedChange={(checked) => 
                  onFiltersChange({
                    ...currentFilters,
                    notConcluded: checked as boolean
                  })
                }
              />
              <label htmlFor="notConcluded" className="text-sm">Não Concluídas</label>
            </div>
          </div>
        </div>

        {/* Botão de Limpar Filtros */}
        <div className="pt-4 border-t">
          <Button variant="ghost" onClick={handleClearFilters} className="w-full">
            Limpar Todos os Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
