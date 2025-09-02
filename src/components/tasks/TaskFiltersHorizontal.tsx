
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, ChevronDown, Filter, Search, X, SortAsc } from "lucide-react";
import { TaskFilter, TaskPriority, TaskStatus, TaskType, SortOption } from "@/types";
import { getCurrentDateInSaoPaulo, getTomorrowInSaoPaulo, getYesterdayInSaoPaulo } from "@/lib/utils";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";

interface TaskFiltersHorizontalProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function TaskFiltersHorizontal({ 
  currentFilters, 
  onFiltersChange, 
  searchQuery, 
  onSearchChange,
  sortBy,
  onSortChange
}: TaskFiltersHorizontalProps) {
  const { teamMembers } = useSupabaseTeamMembers();

  // Funções para datas usando timezone correto
  const today = getCurrentDateInSaoPaulo();
  const tomorrow = getTomorrowInSaoPaulo();
  const yesterday = getYesterdayInSaoPaulo();

  // Verificar se uma data específica está ativa (comparação exata)
  const isDateActive = (dateStr: string) => {
    return currentFilters.dateRange?.start === dateStr && currentFilters.dateRange?.end === dateStr;
  };

  // Contar filtros ativos (todos os filtros)
  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Contar filtros avançados
    if (currentFilters.type && currentFilters.type.length > 0) count++;
    if (currentFilters.priority && currentFilters.priority.length > 0) count++;
    if (currentFilters.status && currentFilters.status.length > 0) count++;
    if (currentFilters.assignedPersonId) count++;
    if (currentFilters.timeInvestment && currentFilters.timeInvestment.length > 0) count++;
    if (currentFilters.category && currentFilters.category.length > 0) count++;
    if (currentFilters.hasChecklist !== undefined) count++;
    if (currentFilters.isForwarded !== undefined) count++;
    if (currentFilters.noOrder !== undefined) count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Função para definir data com mutualidade exclusiva
  const handleDateSelect = (dateStr: string) => {
    // Se já está ativo, desativar (voltar para hoje)
    if (isDateActive(dateStr)) {
      onFiltersChange({
        ...currentFilters,
        dateRange: {
          start: today,
          end: today
        }
      });
    } else {
      // Se não está ativo, ativar apenas esta data
      onFiltersChange({
        ...currentFilters,
        dateRange: {
          start: dateStr,
          end: dateStr
        }
      });
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...currentFilters,
      dateRange: {
        start: field === 'start' ? value : currentFilters.dateRange?.start || today,
        end: field === 'end' ? value : currentFilters.dateRange?.end || today
      }
    });
  };

  const handleStatusFilter = (status: TaskStatus) => {
    const currentStatus = currentFilters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    onFiltersChange({
      ...currentFilters,
      status: newStatus.length > 0 ? newStatus : undefined
    });
  };

  const handleAdvancedFilterChange = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        start: today,
        end: today
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Busca */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-0 top-0 h-9 w-8 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Separador visual */}
      <div className="h-6 w-px bg-border" />

      {/* Quick date filters */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={isDateActive(yesterday) ? "default" : "outline"}
          onClick={() => handleDateSelect(yesterday)}
          className="h-8 px-3 text-xs"
        >
          Ontem
        </Button>
        <Button
          size="sm"
          variant={isDateActive(today) ? "default" : "outline"}
          onClick={() => handleDateSelect(today)}
          className="h-8 px-3 text-xs"
        >
          Hoje
        </Button>
        <Button
          size="sm"
          variant={isDateActive(tomorrow) ? "default" : "outline"}
          onClick={() => handleDateSelect(tomorrow)}
          className="h-8 px-3 text-xs"
        >
          Amanhã
        </Button>
      </div>

      {/* Período personalizado */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">De:</span>
        <Input
          type="date"
          value={currentFilters.dateRange?.start || today}
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
          className="h-8 w-32 text-xs"
        />
        <span className="text-xs text-muted-foreground">Até:</span>
        <Input
          type="date"
          value={currentFilters.dateRange?.end || today}
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
          className="h-8 w-32 text-xs"
        />
      </div>

      {/* Separador visual */}
      <div className="h-6 w-px bg-border" />

      {/* Título Status */}
      <span className="text-sm font-medium text-muted-foreground">Status:</span>

      {/* Status buttons */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={currentFilters.status?.includes('pending') ? "default" : "outline"}
          onClick={() => handleStatusFilter('pending')}
          className="h-8 px-3 text-xs"
        >
          Pendente
        </Button>
        <Button
          size="sm"
          variant={currentFilters.status?.includes('completed') ? "default" : "outline"}
          onClick={() => handleStatusFilter('completed')}
          className="h-8 px-3 text-xs"
        >
          Feito
        </Button>
        <Button
          size="sm"
          variant={currentFilters.status?.includes('not-done') ? "default" : "outline"}
          onClick={() => handleStatusFilter('not-done')}
          className="h-8 px-3 text-xs"
        >
          Não feito
        </Button>
      </div>

      {/* Separador visual */}
      <div className="h-6 w-px bg-border" />

      {/* Reagendamento buttons */}
      <span className="text-sm font-medium text-muted-foreground">Reagendar:</span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={currentFilters.isForwarded === true ? "default" : "outline"}
          onClick={() => {
            const newValue = currentFilters.isForwarded === true ? undefined : true;
            handleAdvancedFilterChange('isForwarded', newValue);
          }}
          className="h-8 px-3 text-xs"
        >
          Reagendadas
        </Button>
        <Button
          size="sm"
          variant={currentFilters.isForwarded === false ? "default" : "outline"}
          onClick={() => {
            const newValue = currentFilters.isForwarded === false ? undefined : false;
            handleAdvancedFilterChange('isForwarded', newValue);
          }}
          className="h-8 px-3 text-xs"
        >
          Não reagendadas
        </Button>
      </div>

      {/* Separador visual */}
      <div className="h-6 w-px bg-border" />

      {/* Ordenação */}
      <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SortAsc className="h-3 w-3 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="order">Por Ordem</SelectItem>
          <SelectItem value="priority">Por Prioridade</SelectItem>
          <SelectItem value="title">Por Título</SelectItem>
          <SelectItem value="type">Por Tipo</SelectItem>
          <SelectItem value="timeInvestment">Por Tempo</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtros avançados */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3 w-3" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <div className="flex flex-wrap gap-1">
                {(['own-task', 'meeting', 'delegated-task'] as TaskType[]).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={currentFilters.type?.includes(type) ? "default" : "outline"}
                    onClick={() => {
                      const current = currentFilters.type || [];
                      const newTypes = current.includes(type)
                        ? current.filter(t => t !== type)
                        : [...current, type];
                      handleAdvancedFilterChange('type', newTypes.length > 0 ? newTypes : undefined);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    {type === 'own-task' ? 'Própria' : type === 'meeting' ? 'Reunião' : 'Delegada'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <div className="flex flex-wrap gap-1">
                {(['none', 'priority', 'extreme'] as TaskPriority[]).map((priority) => (
                  <Button
                    key={priority}
                    size="sm"
                    variant={currentFilters.priority?.includes(priority) ? "default" : "outline"}
                    onClick={() => {
                      const current = currentFilters.priority || [];
                      const newPriorities = current.includes(priority)
                        ? current.filter(p => p !== priority)
                        : [...current, priority];
                      handleAdvancedFilterChange('priority', newPriorities.length > 0 ? newPriorities : undefined);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    {priority === 'none' ? 'Normal' : priority === 'priority' ? 'Prioridade' : 'Extrema'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tempo de Investimento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tempo de Investimento</label>
              <div className="flex flex-wrap gap-1">
                {([
                  { value: 'custom-5', label: '5min' },
                  { value: 'custom-30', label: '30min' },
                  { value: 'low', label: '1h' },
                  { value: 'medium', label: '2h' },
                  { value: 'high', label: '4h' },
                  { value: 'custom-4h', label: '4h' },
                  { value: 'custom-8h', label: '8h' },
                  { value: 'custom', label: 'Personalizado' }
                ] as const).map((timeOption) => (
                  <Button
                    key={timeOption.value}
                    size="sm"
                    variant={currentFilters.timeInvestment?.includes(timeOption.value) ? "default" : "outline"}
                    onClick={() => {
                      const current = currentFilters.timeInvestment || [];
                      const newTimeInvestment = current.includes(timeOption.value)
                        ? current.filter(t => t !== timeOption.value)
                        : [...current, timeOption.value];
                      handleAdvancedFilterChange('timeInvestment', newTimeInvestment.length > 0 ? newTimeInvestment : undefined);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    {timeOption.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Pessoa Delegada */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipe Delegada</label>
              <Select
                value={currentFilters.assignedPersonId || 'all-teams'}
                onValueChange={(value) => handleAdvancedFilterChange('assignedPersonId', value === 'all-teams' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-teams">Todas as equipes</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Outros filtros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Outros</label>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={currentFilters.hasChecklist === true ? "default" : "outline"}
                  onClick={() => {
                    const newValue = currentFilters.hasChecklist === true ? undefined : true;
                    handleAdvancedFilterChange('hasChecklist', newValue);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Com Checklist
                </Button>
                <Button
                  size="sm"
                  variant={currentFilters.category?.includes('personal') ? "default" : "outline"}
                  onClick={() => {
                    const current = currentFilters.category || [];
                    const newCategory = current.includes('personal')
                      ? current.filter(c => c !== 'personal')
                      : [...current, 'personal'];
                    handleAdvancedFilterChange('category', newCategory.length > 0 ? newCategory : undefined);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Pessoal
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Indicador de período selecionado */}
      {currentFilters.dateRange && (
        <Badge variant="secondary" className="text-xs">
          {currentFilters.dateRange.start === currentFilters.dateRange.end
            ? (currentFilters.dateRange.start === today ? 'Hoje' : 
               currentFilters.dateRange.start === tomorrow ? 'Amanhã' : 
               currentFilters.dateRange.start === yesterday ? 'Ontem' : 
               currentFilters.dateRange.start)
            : `${currentFilters.dateRange.start} - ${currentFilters.dateRange.end}`}
        </Badge>
      )}
    </div>
  );
}
