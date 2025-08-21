
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  ArrowUpDown,
  X,
  Target
} from "lucide-react";
import { TaskFilter } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { cn } from "@/lib/utils";
import { SortOption } from "@/lib/taskUtils";

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
  const { people } = useSupabasePeople();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const typeOptions = [
    { value: 'own-task', label: 'Própria' },
    { value: 'meeting', label: 'Reunião' },
    { value: 'forwarded-task', label: 'Repassada' }
  ];

  const priorityOptions = [
    { value: 'extreme', label: 'Extrema' },
    { value: 'priority', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'no-priority', label: 'Baixa' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluída' },
    { value: 'not-done', label: 'Não feita' },
    { value: 'forwarded-date', label: 'Reagendada' },
    { value: 'forwarded-person', label: 'Delegada' }
  ];

  const timeInvestmentOptions = [
    { value: 'low', label: 'Baixo' },
    { value: 'medium', label: 'Médio' },
    { value: 'high', label: 'Alto' }
  ];

  const categoryOptions = [
    { value: 'personal', label: 'Pessoal' },
    { value: 'business', label: 'Profissional' }
  ];

  const sortOptions = [
    { value: 'order' as SortOption, label: 'Ordem' },
    { value: 'priority' as SortOption, label: 'Prioridade' },
    { value: 'date' as SortOption, label: 'Data' },
    { value: 'title' as SortOption, label: 'Título' }
  ];

  const updateFilter = <K extends keyof TaskFilter>(key: K, value: TaskFilter[K]) => {
    onFiltersChange({ ...currentFilters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof TaskFilter>(filterKey: K, value: string) => {
    const currentArray = (currentFilters[filterKey] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(filterKey, newArray.length > 0 ? newArray as any : undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.type?.length) count++;
    if (currentFilters.priority?.length) count++;
    if (currentFilters.status?.length) count++;
    if (currentFilters.assignedPersonId) count++;
    if (currentFilters.timeInvestment?.length) count++;
    if (currentFilters.category?.length) count++;
    if (currentFilters.hasChecklist !== undefined) count++;
    if (currentFilters.isForwarded !== undefined) count++;
    if (currentFilters.noOrder !== undefined) count++;
    if (currentFilters.isProcessed !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Barra de busca e controles principais */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <DateRangePicker
          startDate={currentFilters.dateRange?.start || ''}
          endDate={currentFilters.dateRange?.end || ''}
          onStartDateChange={(start) => updateFilter('dateRange', { 
            start, 
            end: currentFilters.dateRange?.end || '' 
          })}
          onEndDateChange={(end) => updateFilter('dateRange', { 
            start: currentFilters.dateRange?.start || '', 
            end 
          })}
        />

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="gap-1 h-8"
                  >
                    <X className="h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <div className="space-y-2">
                  {typeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={currentFilters.type?.includes(option.value as any) || false}
                        onCheckedChange={() => toggleArrayFilter('type', option.value)}
                      />
                      <label htmlFor={`type-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioridade */}
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridade</label>
                <div className="space-y-2">
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={currentFilters.priority?.includes(option.value as any) || false}
                        onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                      />
                      <label htmlFor={`priority-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={currentFilters.status?.includes(option.value as any) || false}
                        onCheckedChange={() => toggleArrayFilter('status', option.value)}
                      />
                      <label htmlFor={`status-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tempo de Investimento */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tempo de Investimento</label>
                <div className="space-y-2">
                  {timeInvestmentOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${option.value}`}
                        checked={currentFilters.timeInvestment?.includes(option.value as any) || false}
                        onCheckedChange={() => toggleArrayFilter('timeInvestment', option.value)}
                      />
                      <label htmlFor={`time-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <div className="space-y-2">
                  {categoryOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${option.value}`}
                        checked={currentFilters.category?.includes(option.value as any) || false}
                        onCheckedChange={() => toggleArrayFilter('category', option.value)}
                      />
                      <label htmlFor={`category-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pessoa Assignada */}
              {people.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Pessoa</label>
                  <div className="space-y-2">
                    {people.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`person-${person.id}`}
                          checked={currentFilters.assignedPersonId === person.id}
                          onCheckedChange={(checked) => 
                            updateFilter('assignedPersonId', checked ? person.id : undefined)
                          }
                        />
                        <label htmlFor={`person-${person.id}`} className="text-sm">
                          {person.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros especiais */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-checklist"
                    checked={currentFilters.hasChecklist === true}
                    onCheckedChange={(checked) => 
                      updateFilter('hasChecklist', checked ? true : undefined)
                    }
                  />
                  <label htmlFor="has-checklist" className="text-sm">
                    Tem checklist
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-forwarded"
                    checked={currentFilters.isForwarded === true}
                    onCheckedChange={(checked) => 
                      updateFilter('isForwarded', checked ? true : undefined)
                    }
                  />
                  <label htmlFor="is-forwarded" className="text-sm">
                    Reagendadas
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-processed"
                    checked={currentFilters.isProcessed === true}
                    onCheckedChange={(checked) => 
                      updateFilter('isProcessed', checked ? true : undefined)
                    }
                  />
                  <label htmlFor="is-processed" className="text-sm flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Definitivas
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-order"
                    checked={currentFilters.noOrder === true}
                    onCheckedChange={(checked) => 
                      updateFilter('noOrder', checked ? true : undefined)
                    }
                  />
                  <label htmlFor="no-order" className="text-sm">
                    Sem ordem definida
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => onSortChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {currentFilters.type?.map(type => (
            <Badge key={`type-${type}`} variant="secondary" className="gap-1">
              {typeOptions.find(opt => opt.value === type)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('type', type)}
              />
            </Badge>
          ))}
          
          {currentFilters.priority?.map(priority => (
            <Badge key={`priority-${priority}`} variant="secondary" className="gap-1">
              {priorityOptions.find(opt => opt.value === priority)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('priority', priority)}
              />
            </Badge>
          ))}
          
          {currentFilters.status?.map(status => (
            <Badge key={`status-${status}`} variant="secondary" className="gap-1">
              {statusOptions.find(opt => opt.value === status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('status', status)}
              />
            </Badge>
          ))}

          {currentFilters.assignedPersonId && (
            <Badge variant="secondary" className="gap-1">
              {people.find(p => p.id === currentFilters.assignedPersonId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('assignedPersonId', undefined)}
              />
            </Badge>
          )}

          {currentFilters.hasChecklist && (
            <Badge variant="secondary" className="gap-1">
              Tem checklist
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('hasChecklist', undefined)}
              />
            </Badge>
          )}

          {currentFilters.isForwarded && (
            <Badge variant="secondary" className="gap-1">
              Reagendadas
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('isForwarded', undefined)}
              />
            </Badge>
          )}

          {currentFilters.isProcessed && (
            <Badge variant="secondary" className="gap-1">
              <Target className="h-3 w-3" />
              Definitivas
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('isProcessed', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
