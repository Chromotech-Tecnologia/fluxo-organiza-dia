
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Filter, Calendar, Tag, User, Clock, ArrowUpDown, Users } from "lucide-react";
import { TaskFilter } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { SORT_OPTIONS, SortOption } from "@/lib/taskUtils";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { useSupabaseTasks } from "@/hooks/useSupabaseTasks";

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { teamMembers } = useSupabaseTeamMembers();
  const { tasks } = useSupabaseTasks(currentFilters);

  // Obter equipes que têm tarefas delegadas no período filtrado
  const teamsWithDelegatedTasks = teamMembers.filter(team => 
    tasks.some(task => task.type === 'delegated-task' && task.assignedPersonId === team.id)
  );

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

  const clearSpecificFilter = (filterKey: keyof TaskFilter) => {
    const newFilters = { ...currentFilters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Verificar se o range de datas não é o padrão (apenas hoje)
    const today = getCurrentDateInSaoPaulo();
    if (currentFilters.dateRange?.start !== today || currentFilters.dateRange?.end !== today) {
      count++;
    }
    
    if (currentFilters.types && currentFilters.types.length > 0) count++;
    if (currentFilters.priorities && currentFilters.priorities.length > 0) count++;
    if (currentFilters.timeInvestments && currentFilters.timeInvestments.length > 0) count++;
    if (currentFilters.statuses && currentFilters.statuses.length > 0) count++;
    if (currentFilters.assignedPersonId) count++;
    if (searchQuery.trim()) count++;
    if (sortBy !== 'order') count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Linha principal: Busca, Ordenação e Filtros */}
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
              onClick={() => onSearchChange("")}
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

        {/* Período */}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DateRangePicker
            startDate={currentFilters.dateRange?.start || getCurrentDateInSaoPaulo()}
            endDate={currentFilters.dateRange?.end || getCurrentDateInSaoPaulo()}
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

        {/* Equipe Delegada */}
        {teamsWithDelegatedTasks.length > 0 && (
          <Select
            value={currentFilters.assignedPersonId || ""}
            onValueChange={(value) =>
              onFiltersChange({
                ...currentFilters,
                assignedPersonId: value || undefined
              })
            }
          >
            <SelectTrigger className="w-48 h-8">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <SelectValue placeholder="Equipe delegada" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as equipes</SelectItem>
              {teamsWithDelegatedTasks.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Mais Filtros */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3 w-3" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Tipos */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tipos
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'personal-task', label: 'Pessoal' },
                    { value: 'meeting', label: 'Reunião' },
                    { value: 'delegated-task', label: 'Delegada' }
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={currentFilters.types?.includes(type.value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentTypes = currentFilters.types || [];
                          const newTypes = checked
                            ? [...currentTypes, type.value as any]
                            : currentTypes.filter(t => t !== type.value);
                          onFiltersChange({
                            ...currentFilters,
                            types: newTypes.length > 0 ? newTypes : undefined
                          });
                        }}
                      />
                      <label htmlFor={`type-${type.value}`} className="text-sm">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioridades */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Prioridades
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'extreme', label: 'Extrema' },
                    { value: 'priority', label: 'Prioridade' },
                    { value: 'none', label: 'Normal' }
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={currentFilters.priorities?.includes(priority.value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentPriorities = currentFilters.priorities || [];
                          const newPriorities = checked
                            ? [...currentPriorities, priority.value as any]
                            : currentPriorities.filter(p => p !== priority.value);
                          onFiltersChange({
                            ...currentFilters,
                            priorities: newPriorities.length > 0 ? newPriorities : undefined
                          });
                        }}
                      />
                      <label htmlFor={`priority-${priority.value}`} className="text-sm">
                        {priority.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tempo de Investimento */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tempo
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Baixo (5min)' },
                    { value: 'medium', label: 'Médio (1h)' },
                    { value: 'high', label: 'Alto (2h)' }
                  ].map((time) => (
                    <div key={time.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${time.value}`}
                        checked={currentFilters.timeInvestments?.includes(time.value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentTimes = currentFilters.timeInvestments || [];
                          const newTimes = checked
                            ? [...currentTimes, time.value as any]
                            : currentTimes.filter(t => t !== time.value);
                          onFiltersChange({
                            ...currentFilters,
                            timeInvestments: newTimes.length > 0 ? newTimes : undefined
                          });
                        }}
                      />
                      <label htmlFor={`time-${time.value}`} className="text-sm">
                        {time.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'pending', label: 'Pendente' },
                    { value: 'completed', label: 'Feito' },
                    { value: 'not-done', label: 'Não Feito' }
                  ].map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={currentFilters.statuses?.includes(status.value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentStatuses = currentFilters.statuses || [];
                          const newStatuses = checked
                            ? [...currentStatuses, status.value as any]
                            : currentStatuses.filter(s => s !== status.value);
                          onFiltersChange({
                            ...currentFilters,
                            statuses: newStatuses.length > 0 ? newStatuses : undefined
                          });
                        }}
                      />
                      <label htmlFor={`status-${status.value}`} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Limpar Filtros */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
            <X className="h-3 w-3" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-1 flex-wrap">
          {currentFilters.types && currentFilters.types.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tipos: {currentFilters.types.length}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearSpecificFilter('types')}
              />
            </Badge>
          )}
          
          {currentFilters.priorities && currentFilters.priorities.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Prioridades: {currentFilters.priorities.length}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearSpecificFilter('priorities')}
              />
            </Badge>
          )}
          
          {currentFilters.timeInvestments && currentFilters.timeInvestments.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tempo: {currentFilters.timeInvestments.length}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearSpecificFilter('timeInvestments')}
              />
            </Badge>
          )}
          
          {currentFilters.statuses && currentFilters.statuses.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {currentFilters.statuses.length}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearSpecificFilter('statuses')}
              />
            </Badge>
          )}

          {currentFilters.assignedPersonId && (
            <Badge variant="secondary" className="gap-1">
              Equipe: {teamsWithDelegatedTasks.find(t => t.id === currentFilters.assignedPersonId)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearSpecificFilter('assignedPersonId')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
