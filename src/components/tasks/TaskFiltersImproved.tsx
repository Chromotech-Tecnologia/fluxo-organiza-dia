
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "./DateRangePicker";
import { PeopleSelect } from "../people/PeopleSelect";
import { X, Search, Filter } from "lucide-react";
import { TaskFilter, SortOption } from "@/types";
import { SORT_OPTIONS } from "@/lib/taskUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFiltersImprovedProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function TaskFiltersImproved({ 
  currentFilters, 
  onFiltersChange, 
  searchQuery, 
  onSearchChange,
  sortBy,
  onSortChange 
}: TaskFiltersImprovedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
    onSortChange('order');
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0 || searchQuery;

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
                <label className="text-xs font-medium mb-1 block">Tempo</label>
                <div className="flex gap-1">
                  <Button 
                    variant={currentFilters.timeInvestment?.includes('low') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.timeInvestment || [];
                      const newTime = current.includes('low') 
                        ? current.filter(t => t !== 'low')
                        : [...current, 'low'];
                      handleFilterChange('timeInvestment', newTime.length ? newTime : undefined);
                    }}
                  >
                    Baixo
                  </Button>
                  <Button 
                    variant={currentFilters.timeInvestment?.includes('medium') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.timeInvestment || [];
                      const newTime = current.includes('medium') 
                        ? current.filter(t => t !== 'medium')
                        : [...current, 'medium'];
                      handleFilterChange('timeInvestment', newTime.length ? newTime : undefined);
                    }}
                  >
                    Médio
                  </Button>
                  <Button 
                    variant={currentFilters.timeInvestment?.includes('high') ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const current = currentFilters.timeInvestment || [];
                      const newTime = current.includes('high') 
                        ? current.filter(t => t !== 'high')
                        : [...current, 'high'];
                      handleFilterChange('timeInvestment', newTime.length ? newTime : undefined);
                    }}
                  >
                    Alto
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
                variant={currentFilters.isForwarded === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('isForwarded', currentFilters.isForwarded === true ? undefined : true)}
              >
                Reagendadas
              </Button>

              <Button 
                variant={currentFilters.isForwarded === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('isForwarded', currentFilters.isForwarded === false ? undefined : false)}
              >
                Não Reagendadas
              </Button>

              <Button 
                variant={currentFilters.sharedByMe === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('sharedByMe', currentFilters.sharedByMe === true ? undefined : true)}
              >
                Compartilhadas por Mim
              </Button>

              <Button 
                variant={currentFilters.sharedWithMe === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('sharedWithMe', currentFilters.sharedWithMe === true ? undefined : true)}
              >
                Compartilhadas Comigo
              </Button>

              <Button 
                variant={currentFilters.sharedByMe === true || currentFilters.sharedWithMe === true ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const hasSharedFilter = currentFilters.sharedByMe === true || currentFilters.sharedWithMe === true;
                  if (hasSharedFilter) {
                    handleFilterChange('sharedByMe', undefined);
                    handleFilterChange('sharedWithMe', undefined);
                  } else {
                    handleFilterChange('sharedByMe', true);
                    handleFilterChange('sharedWithMe', true);
                  }
                }}
              >
                Tarefa Compartilhada
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
                Concluído
              </Button>

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
                Não Concluído
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
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar
            </Button>
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
                {status === 'pending' ? 'Pendente' : status === 'completed' ? 'Definitivo' : 'Não Feito'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  const newStatus = currentFilters.status?.filter(s => s !== status);
                  handleFilterChange('status', newStatus?.length ? newStatus : undefined);
                }} />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
