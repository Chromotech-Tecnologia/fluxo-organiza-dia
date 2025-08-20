import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TaskFilter, TaskPriority, TaskStatus, TaskType } from "@/types";
import { useEffect, useState } from "react";
import { PeopleSelect } from "../people/PeopleSelect";
import { DateRangePicker } from "./DateRangePicker";

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const [type, setType] = useState<TaskType[]>(currentFilters.type || []);
  const [priority, setPriority] = useState<TaskPriority[]>(currentFilters.priority || []);
  const [status, setStatus] = useState<TaskStatus[]>(currentFilters.status || []);
  const [assignedPersonId, setAssignedPersonId] = useState<string | undefined>(currentFilters.assignedPersonId);

  const handleDateRangeChange = (start: string, end: string) => {
    onFiltersChange({
      ...currentFilters,
      dateRange: { start, end }
    });
  };

  const handleTypeChange = (value: TaskType[]) => {
    setType(value);
    onFiltersChange({
      ...currentFilters,
      type: value
    });
  };

  const handlePriorityChange = (value: TaskPriority[]) => {
    setPriority(value);
    onFiltersChange({
      ...currentFilters,
      priority: value
    });
  };

  const handleStatusChange = (value: TaskStatus[]) => {
    setStatus(value);
    onFiltersChange({
      ...currentFilters,
      status: value
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
    setType([]);
    setPriority([]);
    setStatus([]);
    setAssignedPersonId(undefined);
    onFiltersChange({});
  };

  useEffect(() => {
    setType(currentFilters.type || []);
    setPriority(currentFilters.priority || []);
    setStatus(currentFilters.status || []);
    setAssignedPersonId(currentFilters.assignedPersonId);
  }, [currentFilters]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filtro de Data com DateRangePicker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <DateRangePicker
              startDate={currentFilters.dateRange?.start || ''}
              endDate={currentFilters.dateRange?.end || ''}
              onStartDateChange={(date) => handleDateRangeChange(date, currentFilters.dateRange?.end || date)}
              onEndDateChange={(date) => handleDateRangeChange(currentFilters.dateRange?.start || date, date)}
            />
          </div>

          {/* Filtros de Tipo, Prioridade e Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo</Label>
              <Select onValueChange={(value) => handleTypeChange(value === 'all' ? [] : [value as TaskType])}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="own-task">Tarefa Própria</SelectItem>
                  <SelectItem value="delegated-task">Tarefa Delegada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
              <Select onValueChange={(value) => handlePriorityChange(value === 'all' ? [] : [value as TaskPriority])}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder="Todas as Prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                  <SelectItem value="extreme">Extrema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <Select onValueChange={(value) => handleStatusChange(value === 'all' ? [] : [value as TaskStatus])}>
                <SelectTrigger className="text-left">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="not-done">Não Feita</SelectItem>
                  <SelectItem value="forwarded-date">Repassada (Data)</SelectItem>
                  <SelectItem value="forwarded-person">Repassada (Pessoa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtro por Pessoa Designada */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Pessoa Designada</Label>
            <PeopleSelect
              value={assignedPersonId}
              onChange={handleAssignedPersonChange}
              placeholder="Todas as Pessoas"
            />
          </div>

          {/* Novos Filtros de Estado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* Botão de Limpar Filtros */}
          <Button variant="ghost" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
