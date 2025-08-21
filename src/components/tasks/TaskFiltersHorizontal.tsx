
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "./DateRangePicker";
import { PeopleSelect } from "../people/PeopleSelect";
import { X, Search, Filter, ArrowRight, Shield } from "lucide-react";
import { TaskFilter } from "@/types";
import { SORT_OPTIONS, SortOption } from "@/lib/taskUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: currentFilters.dateRange // Manter apenas o filtro de data
    });
    onSearchChange('');
    onSortChange('order');
  };

  const hasActiveFilters = Object.keys(currentFilters).filter(key => key !== 'dateRange').length > 0 || searchQuery;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtros Primeira Linha */}
        <div className="flex flex-wrap gap-2">
          <DateRangePicker
            startDate={currentFilters.dateRange?.start || new Date().toISOString().split('T')[0]}
            endDate={currentFilters.dateRange?.end || new Date().toISOString().split('T')[0]}
            onStartDateChange={(date) => handleFilterChange('dateRange', { 
              start: date, 
              end: currentFilters.dateRange?.end || date 
            })}
            onEndDateChange={(date) => handleFilterChange('dateRange', { 
              start: currentFilters.dateRange?.start || date, 
              end: date 
            })}
          />
          
          <Button 
            variant={currentFilters.status?.includes('pending') ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const current = currentFilters.status || [];
              const newStatus = current.includes('pending') 
                ? current.filter(s => s !== 'pending')
                : [...current, 'pending'];
              handleFilterChange('status', newStatus.length ? newStatus : undefined);
            }}
          >
            Pendente
          </Button>

          <Button 
            variant={currentFilters.status?.includes('completed') ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const current = currentFilters.status || [];
              const newStatus = current.includes('completed') 
                ? current.filter(s => s !== 'completed')
                : [...current, 'completed'];
              handleFilterChange('status', newStatus.length ? newStatus : undefined);
            }}
          >
            Feitas
          </Button>

          <Button 
            variant={currentFilters.status?.includes('not-done') ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const current = currentFilters.status || [];
              const newStatus = current.includes('not-done') 
                ? current.filter(s => s !== 'not-done')
                : [...current, 'not-done'];
              handleFilterChange('status', newStatus.length ? newStatus : undefined);
            }}
          >
            Não Feitas
          </Button>

          <Button 
            variant={currentFilters.isForwarded === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('isForwarded', currentFilters.isForwarded === true ? undefined : true)}
            className="gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Reagendadas
          </Button>

          <Button 
            variant={currentFilters.isForwarded === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('isForwarded', currentFilters.isForwarded === false ? undefined : false)}
            className="gap-1"
          >
            <Shield className="h-3 w-3" />
            Não Reagendadas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Mais Filtros
          </Button>
        </div>

        {/* Filtros Expandidos */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Tipo</label>
                <div className="flex gap-1">
                  <Button 
                    variant={currentFilters.type?.includes('meeting') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.type || [];
                      const newType = current.includes('meeting') 
                        ? current.filter(t => t !== 'meeting')
                        : [...current, 'meeting'];
                      handleFilterChange('type', newType.length ? newType : undefined);
                    }}
                  >
                    Reunião
                  </Button>
                  <Button 
                    variant={currentFilters.type?.includes('delegated-task') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.type || [];
                      const newType = current.includes('delegated-task') 
                        ? current.filter(t => t !== 'delegated-task')
                        : [...current, 'delegated-task'];
                      handleFilterChange('type', newType.length ? newType : undefined);
                    }}
                  >
                    Equipe
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Prioridade</label>
                <div className="flex gap-1">
                  <Button 
                    variant={currentFilters.priority?.includes('priority') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.priority || [];
                      const newPriority = current.includes('priority') 
                        ? current.filter(p => p !== 'priority')
                        : [...current, 'priority'];
                      handleFilterChange('priority', newPriority.length ? newPriority : undefined);
                    }}
                  >
                    Prioridade
                  </Button>
                  <Button 
                    variant={currentFilters.priority?.includes('extreme') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.priority || [];
                      const newPriority = current.includes('extreme') 
                        ? current.filter(p => p !== 'extreme')
                        : [...current, 'extreme'];
                      handleFilterChange('priority', newPriority.length ? newPriority : undefined);
                    }}
                  >
                    Extrema
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Categoria</label>
                <div className="flex gap-1">
                  <Button 
                    variant={currentFilters.category?.includes('personal') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.category || [];
                      const newCategory = current.includes('personal') 
                        ? current.filter(c => c !== 'personal')
                        : [...current, 'personal'];
                      handleFilterChange('category', newCategory.length ? newCategory : undefined);
                    }}
                  >
                    Pessoal
                  </Button>
                  <Button 
                    variant={currentFilters.category?.includes('business') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.category || [];
                      const newCategory = current.includes('business') 
                        ? current.filter(c => c !== 'business')
                        : [...current, 'business'];
                      handleFilterChange('category', newCategory.length ? newCategory : undefined);
                    }}
                  >
                    Profissional
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Equipe Responsável</label>
                <PeopleSelect
                  value={currentFilters.assignedPersonId || undefined}
                  onChange={(value) => handleFilterChange('assignedPersonId', value || undefined)}
                  placeholder="Selecionar..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant={currentFilters.hasChecklist === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('hasChecklist', currentFilters.hasChecklist === true ? undefined : true)}
              >
                Com Checklist
              </Button>

              <Button 
                variant={currentFilters.noOrder === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('noOrder', currentFilters.noOrder === true ? undefined : true)}
              >
                Sem Ordem
              </Button>
            </div>
          </div>
        )}

        {/* Segunda Linha - Ordenação e Ações */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Ordenar por:</label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Limpar
              </Button>
            )}
            <Button onClick={() => setIsExpanded(false)} size="sm">
              Aplicar
            </Button>
          </div>
        </div>

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Busca: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange('')} />
              </Badge>
            )}
            {currentFilters.status?.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {status === 'pending' ? 'Pendente' : 
                 status === 'completed' ? 'Feitas' : 
                 status === 'not-done' ? 'Não Feitas' : status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  const newStatus = currentFilters.status?.filter(s => s !== status);
                  handleFilterChange('status', newStatus?.length ? newStatus : undefined);
                }} />
              </Badge>
            ))}
            {currentFilters.isForwarded === true && (
              <Badge variant="secondary" className="gap-1">
                Reagendadas
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('isForwarded', undefined)} />
              </Badge>
            )}
            {currentFilters.isForwarded === false && (
              <Badge variant="secondary" className="gap-1">
                Não Reagendadas
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('isForwarded', undefined)} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
