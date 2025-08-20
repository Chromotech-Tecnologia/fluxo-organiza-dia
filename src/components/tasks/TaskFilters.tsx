
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { TaskFilter, TaskType, TaskPriority, TaskStatus } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { PeopleSelect } from "@/components/people/PeopleSelect";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { format, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const today = getCurrentDateInSaoPaulo();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleQuickDateFilter = (dateType: 'today' | 'yesterday' | 'tomorrow') => {
    let targetDate: string;
    switch (dateType) {
      case 'yesterday':
        targetDate = yesterday;
        break;
      case 'tomorrow':
        targetDate = tomorrow;
        break;
      default:
        targetDate = today;
    }

    onFiltersChange({
      ...currentFilters,
      dateRange: {
        start: targetDate,
        end: targetDate
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    currentFilters.dateRange ||
    currentFilters.type?.length ||
    currentFilters.priority?.length ||
    currentFilters.status?.length ||
    currentFilters.assignedPersonId
  );

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          {/* Data */}
          <div className="flex items-center gap-1">
            <Button
              variant={currentFilters.dateRange?.start === today && currentFilters.dateRange?.end === today ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickDateFilter('today')}
              className="h-7 px-2 text-xs"
            >
              Hoje
            </Button>
            <Button
              variant={currentFilters.dateRange?.start === yesterday && currentFilters.dateRange?.end === yesterday ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickDateFilter('yesterday')}
              className="h-7 px-2 text-xs"
            >
              Ontem
            </Button>
            <Button
              variant={currentFilters.dateRange?.start === tomorrow && currentFilters.dateRange?.end === tomorrow ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickDateFilter('tomorrow')}
              className="h-7 px-2 text-xs"
            >
              Amanhã
            </Button>
            <DateRangePicker
              value={currentFilters.dateRange}
              onChange={(dateRange) => onFiltersChange({ ...currentFilters, dateRange })}
            />
          </div>

          {/* Tipo */}
          <Select
            value={currentFilters.type?.[0] || "all"}
            onValueChange={(value) => {
              const type = value === "all" ? undefined : [value as TaskType];
              onFiltersChange({ ...currentFilters, type });
            }}
          >
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="own-task">Própria</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="delegated-task">Delegada</SelectItem>
            </SelectContent>
          </Select>

          {/* Prioridade */}
          <Select
            value={currentFilters.priority?.[0] || "all"}
            onValueChange={(value) => {
              const priority = value === "all" ? undefined : [value as TaskPriority];
              onFiltersChange({ ...currentFilters, priority });
            }}
          >
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="extreme">Extrema</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={currentFilters.status?.[0] || "all"}
            onValueChange={(value) => {
              const status = value === "all" ? undefined : [value as TaskStatus];
              onFiltersChange({ ...currentFilters, status });
            }}
          >
            <SelectTrigger className="w-32 h-7 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="not-done">Não Feita</SelectItem>
            </SelectContent>
          </Select>

          {/* Pessoa */}
          <div className="w-40">
            <PeopleSelect
              value={currentFilters.assignedPersonId || ""}
              onValueChange={(value) => {
                onFiltersChange({
                  ...currentFilters,
                  assignedPersonId: value || undefined
                });
              }}
              placeholder="Pessoa"
              className="h-7 text-xs"
            />
          </div>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {currentFilters.dateRange && (
              <Badge variant="secondary" className="text-xs">
                {currentFilters.dateRange.start === currentFilters.dateRange.end
                  ? format(new Date(currentFilters.dateRange.start + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                  : `${format(new Date(currentFilters.dateRange.start + 'T00:00:00'), 'dd/MM', { locale: ptBR })} - ${format(new Date(currentFilters.dateRange.end + 'T00:00:00'), 'dd/MM', { locale: ptBR })}`
                }
              </Badge>
            )}
            {currentFilters.type?.map(type => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type === 'own-task' ? 'Própria' : type === 'meeting' ? 'Reunião' : 'Delegada'}
              </Badge>
            ))}
            {currentFilters.priority?.map(priority => (
              <Badge key={priority} variant="secondary" className="text-xs">
                {priority === 'none' ? 'Sem Prioridade' : priority === 'priority' ? 'Prioridade' : 'Extrema'}
              </Badge>
            ))}
            {currentFilters.status?.map(status => (
              <Badge key={status} variant="secondary" className="text-xs">
                {status === 'pending' ? 'Pendente' : status === 'completed' ? 'Concluída' : 'Não Feita'}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
