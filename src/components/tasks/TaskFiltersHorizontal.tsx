
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, X, Filter, Calendar, ArrowUpDown, Users, ChevronDown } from "lucide-react";
import { TaskFilter } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { SORT_OPTIONS, SortOption } from "@/lib/taskUtils";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";
import { addDays, subDays, format } from "date-fns";

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
  onSortChange,
}: TaskFiltersHorizontalProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { teamMembers } = useSupabaseTeamMembers();
  const { tasks } = useSupabaseTasks(currentFilters);

  // Obter equipes que têm tarefas delegadas no período filtrado
  const teamsWithDelegatedTasks = teamMembers.filter(team => 
    tasks.some(task => task.type === 'delegated-task' && task.assignedPersonId === team.id)
  );

  // Funções de data
  const today = getCurrentDateInSaoPaulo();
  const yesterday = format(subDays(new Date(today), 1), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(today), 1), 'yyyy-MM-dd');

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {
        start: getCurrentDateInSaoPaulo(),
        end: getCurrentDateInSaoPaulo()
      }
    });
    onSearchChange("");
    onSortChange('order');
  };

  const clearOnlySearch = () => {
    onSearchChange("");
  };

  const setDateRange = (start: string, end?: string) => {
    onFiltersChange({
      ...currentFilters,
      dateRange: {
        start,
        end: end || start
      }
    });
  };

  const toggleStatus = (status: 'pending' | 'completed' | 'not-done') => {
    const currentStatuses = Array.isArray(currentFilters.status) ? currentFilters.status : [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...currentFilters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const toggleType = (type: 'own-task' | 'meeting' | 'delegated-task') => {
    const currentTypes = Array.isArray(currentFilters.type) ? currentFilters.type : [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({
      ...currentFilters,
      type: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const togglePriority = (priority: 'extreme' | 'priority' | 'none') => {
    const currentPriorities = Array.isArray(currentFilters.priority) ? currentFilters.priority : [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFiltersChange({
      ...currentFilters,
      priority: newPriorities.length > 0 ? newPriorities : undefined
    });
  };

  const toggleTimeInvestment = (time: 'low' | 'medium' | 'high') => {
    const currentTimes = Array.isArray(currentFilters.timeInvestment) ? currentFilters.timeInvestment : [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter(t => t !== time)
      : [...currentTimes, time];
    
    onFiltersChange({
      ...currentFilters,
      timeInvestment: newTimes.length > 0 ? newTimes : undefined
    });
  };

  // Verificar se status está ativo
  const isStatusActive = (status: 'pending' | 'completed' | 'not-done') => {
    return Array.isArray(currentFilters.status) && currentFilters.status.includes(status);
  };

  // Verificar se tipo está ativo
  const isTypeActive = (type: 'own-task' | 'meeting' | 'delegated-task') => {
    return Array.isArray(currentFilters.type) && currentFilters.type.includes(type);
  };

  // Verificar se prioridade está ativa
  const isPriorityActive = (priority: 'extreme' | 'priority' | 'none') => {
    return Array.isArray(currentFilters.priority) && currentFilters.priority.includes(priority);
  };

  // Verificar se tempo está ativo
  const isTimeActive = (time: 'low' | 'medium' | 'high') => {
    return Array.isArray(currentFilters.timeInvestment) && currentFilters.timeInvestment.includes(time);
  };

  // Verificar se data está ativa (agora exclusiva)
  const isDateActive = (dateStr: string) => {
    return currentFilters.dateRange?.start === dateStr && currentFilters.dateRange?.end === dateStr;
  };

  // Contar filtros ativos (todos os filtros, não apenas avançados)
  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Verificar se o range de datas não é o padrão (apenas hoje)
    if (currentFilters.dateRange?.start !== today || currentFilters.dateRange?.end !== today) {
      count++;
    }
    
    if (currentFilters.type && Array.isArray(currentFilters.type) && currentFilters.type.length > 0) count++;
    if (currentFilters.priority && Array.isArray(currentFilters.priority) && currentFilters.priority.length > 0) count++;
    if (currentFilters.timeInvestment && Array.isArray(currentFilters.timeInvestment) && currentFilters.timeInvestment.length > 0) count++;
    if (currentFilters.status && Array.isArray(currentFilters.status) && currentFilters.status.length > 0) count++;
    if (currentFilters.assignedPersonId) count++;
    if (searchQuery.trim()) count++;
    if (sortBy !== 'order') count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-3">
      {/* Primeira linha: Busca, Ordenação e Equipes */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Busca */}
        <div className="relative min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearOnlySearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Ordenação */}
        <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
          <SelectTrigger className="w-40 h-8">
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Todas as Equipes */}
        <Select
          value={currentFilters.assignedPersonId || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...currentFilters,
              assignedPersonId: value === "all" ? undefined : value
            })
          }
        >
          <SelectTrigger className="w-48 h-8">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <SelectValue placeholder="Todas as Equipes" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Equipes</SelectItem>
            {teamsWithDelegatedTasks.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Segunda linha: Datas rápidas, Date Range e Status */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Botões de data rápida - agora exclusivos */}
        <Button
          variant={isDateActive(yesterday) ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setDateRange(yesterday)}
        >
          Ontem
        </Button>
        
        <Button
          variant={isDateActive(today) ? "default" : "outline"}
          size="sm" 
          className="h-8"
          onClick={() => setDateRange(today)}
        >
          Hoje
        </Button>
        
        <Button
          variant={isDateActive(tomorrow) ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setDateRange(tomorrow)}
        >
          Amanhã
        </Button>

        {/* Separador visual */}
        <div className="h-6 w-px bg-border" />

        {/* Seletor de período personalizado */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <DateRangePicker
            startDate={currentFilters.dateRange?.start || today}
            endDate={currentFilters.dateRange?.end || today}
            onStartDateChange={(date) =>
              onFiltersChange({
                ...currentFilters,
                dateRange: { ...currentFilters.dateRange!, start: date }
              })
            }
            onEndDateChange={(date) =>
              onFiltersChange({
                ...currentFilters,
                dateRange: { ...currentFilters.dateRange!, end: date }
              })
            }
          />
        </div>

        {/* Separador visual */}
        <div className="h-6 w-px bg-border" />

        {/* Status buttons */}
        <div className="flex gap-1">
          <Button
            variant={isStatusActive('pending') ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => toggleStatus('pending')}
          >
            Pendente
          </Button>
          
          <Button
            variant={isStatusActive('completed') ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => toggleStatus('completed')}
          >
            Feito
          </Button>
          
          <Button
            variant={isStatusActive('not-done') ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => toggleStatus('not-done')}
          >
            Não Feito
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3 w-3" />
            Filtros Avançados
            <ChevronDown className={`h-3 w-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3">
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            {/* Tipos */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipos</label>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={isTypeActive('own-task') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleType('own-task')}
                >
                  Pessoal
                </Button>
                <Button
                  variant={isTypeActive('meeting') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleType('meeting')}
                >
                  Reunião
                </Button>
                <Button
                  variant={isTypeActive('delegated-task') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleType('delegated-task')}
                >
                  Delegada
                </Button>
              </div>
            </div>

            {/* Prioridades */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridades</label>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={isPriorityActive('extreme') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => togglePriority('extreme')}
                >
                  Extrema
                </Button>
                <Button
                  variant={isPriorityActive('priority') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => togglePriority('priority')}
                >
                  Prioridade
                </Button>
                <Button
                  variant={isPriorityActive('none') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => togglePriority('none')}
                >
                  Normal
                </Button>
              </div>
            </div>

            {/* Tempo de Investimento */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tempo de Investimento</label>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={isTimeActive('low') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleTimeInvestment('low')}
                >
                  Baixo (5min)
                </Button>
                <Button
                  variant={isTimeActive('medium') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleTimeInvestment('medium')}
                >
                  Médio (1h)
                </Button>
                <Button
                  variant={isTimeActive('high') ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleTimeInvestment('high')}
                >
                  Alto (2h)
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Botão Limpar Filtros e Tags ativas */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
            <X className="h-3 w-3" />
            Limpar Filtros ({activeFiltersCount})
          </Button>
          
          {/* Tags de filtros ativos */}
          <div className="flex gap-1 flex-wrap">
            {currentFilters.type && Array.isArray(currentFilters.type) && currentFilters.type.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Tipos: {currentFilters.type.length}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...currentFilters, type: undefined })}
                />
              </Badge>
            )}
            
            {currentFilters.priority && Array.isArray(currentFilters.priority) && currentFilters.priority.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Prioridades: {currentFilters.priority.length}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...currentFilters, priority: undefined })}
                />
              </Badge>
            )}
            
            {currentFilters.timeInvestment && Array.isArray(currentFilters.timeInvestment) && currentFilters.timeInvestment.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Tempo: {currentFilters.timeInvestment.length}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...currentFilters, timeInvestment: undefined })}
                />
              </Badge>
            )}

            {currentFilters.assignedPersonId && (
              <Badge variant="secondary" className="gap-1">
                Equipe: {teamsWithDelegatedTasks.find(t => t.id === currentFilters.assignedPersonId)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...currentFilters, assignedPersonId: undefined })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
