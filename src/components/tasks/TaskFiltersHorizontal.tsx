import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Filter, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaskFilter } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SortOption, SORT_OPTIONS } from "@/lib/taskUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaskFiltersHorizontalProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export function TaskFiltersHorizontal({
  currentFilters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}: TaskFiltersHorizontalProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const today = getCurrentDateInSaoPaulo();

  const handleQuickDateFilter = (days: number) => {
    const targetDate = days === 0 ? today : days > 0 ? addDays(new Date(today), days) : subDays(new Date(today), Math.abs(days));
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    onFiltersChange({
      ...currentFilters,
      dateRange: {
        start: dateString,
        end: dateString
      }
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    const dateString = format(date, 'yyyy-MM-dd');
    onFiltersChange({
      ...currentFilters,
      dateRange: {
        ...currentFilters.dateRange,
        [field]: dateString
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        start: today,
        end: today
      }
    });
    onSearchChange('');
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const isFiltered = 
    searchQuery !== '' ||
    currentFilters.type?.length > 0 ||
    currentFilters.priority?.length > 0 ||
    currentFilters.status?.length > 0 ||
    currentFilters.assignedPersonId ||
    currentFilters.timeInvestment?.length > 0 ||
    currentFilters.category?.length > 0 ||
    currentFilters.hasChecklist !== undefined ||
    currentFilters.isForwarded !== undefined ||
    currentFilters.noOrder !== undefined;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Primeira linha: Atalhos de data, intervalo, status e tipo */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Atalhos de data */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === format(subDays(new Date(today), 1), 'yyyy-MM-dd') ? "default" : "outline"}
              onClick={() => handleQuickDateFilter(-1)}
              className="h-8 px-3 text-xs"
            >
              Ontem
            </Button>
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === today && currentFilters.dateRange?.end === today ? "default" : "outline"}
              onClick={() => handleQuickDateFilter(0)}
              className="h-8 px-3 text-xs"
            >
              Hoje
            </Button>
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === format(addDays(new Date(today), 1), 'yyyy-MM-dd') ? "default" : "outline"}
              onClick={() => handleQuickDateFilter(1)}
              className="h-8 px-3 text-xs"
            >
              Amanhã
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Seletores de data */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">De:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {currentFilters.dateRange?.start ? format(new Date(currentFilters.dateRange.start), 'dd/MM', { locale: ptBR }) : 'Data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentFilters.dateRange?.start ? new Date(currentFilters.dateRange.start) : undefined}
                  onSelect={(date) => handleDateRangeChange('start', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">Até:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {currentFilters.dateRange?.end ? format(new Date(currentFilters.dateRange.end), 'dd/MM', { locale: ptBR }) : 'Data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentFilters.dateRange?.end ? new Date(currentFilters.dateRange.end) : undefined}
                  onSelect={(date) => handleDateRangeChange('end', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Status */}
          <Select 
            value={currentFilters.status?.[0] || "all"} 
            onValueChange={(value) => onFiltersChange({
              ...currentFilters,
              status: value === 'all' ? undefined : [value as any]
            })}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Completa</SelectItem>
              <SelectItem value="not-done">Não Feita</SelectItem>
            </SelectContent>
          </Select>

          {/* Tipo */}
          <Select 
            value={currentFilters.type?.[0] || "all"} 
            onValueChange={(value) => onFiltersChange({
              ...currentFilters,
              type: value === 'all' ? undefined : [value as any]
            })}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="task">Tarefa</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="delegated-task">Delegada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Segunda linha: Busca, ordenação e controles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Busca com botão limpar */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pr-8 text-xs"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Ordenação */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão mais filtros */}
          <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Filtros
                {isFiltered && <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">!</Badge>}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {/* Botão limpar */}
          {isFiltered && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllFilters}
              className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Filtros avançados (colapsáveis) */}
        <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
          <CollapsibleContent className="space-y-3">
            {/* Terceira linha: Filtros avançados */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {/* Prioridade */}
              <Select 
                value={currentFilters.priority?.[0] || "all"} 
                onValueChange={(value) => onFiltersChange({
                  ...currentFilters,
                  priority: value === 'all' ? undefined : [value as any]
                })}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="extreme">Extrema</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                  <SelectItem value="none">Nenhuma</SelectItem>
                </SelectContent>
              </Select>

              {/* Tempo */}
              <Select 
                value={currentFilters.timeInvestment?.[0] || "all"} 
                onValueChange={(value) => onFiltersChange({
                  ...currentFilters,
                  timeInvestment: value === 'all' ? undefined : [value as any]
                })}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>

              {/* Categoria */}
              <Select 
                value={currentFilters.category?.[0] || "all"} 
                onValueChange={(value) => onFiltersChange({
                  ...currentFilters,
                  category: value === 'all' ? undefined : [value as any]
                })}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="business">Negócios</SelectItem>
                </SelectContent>
              </Select>

              {/* Checklist */}
              <Select 
                value={currentFilters.hasChecklist === undefined ? "all" : currentFilters.hasChecklist ? "yes" : "no"} 
                onValueChange={(value) => onFiltersChange({
                  ...currentFilters,
                  hasChecklist: value === 'all' ? undefined : value === 'yes'
                })}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Checklist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="yes">Com Checklist</SelectItem>
                  <SelectItem value="no">Sem Checklist</SelectItem>
                </SelectContent>
              </Select>

              {/* Reagendadas */}
              <Select 
                value={currentFilters.isForwarded === undefined ? "all" : currentFilters.isForwarded ? "yes" : "no"} 
                onValueChange={(value) => onFiltersChange({
                  ...currentFilters,
                  isForwarded: value === 'all' ? undefined : value === 'yes'
                })}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Reagendadas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="yes">Reagendadas</SelectItem>
                  <SelectItem value="no">Não Reagendadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
