
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, X, Filter } from "lucide-react";
import { TaskFilter, TaskType, TaskPriority, TaskStatus } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { PeopleSelect } from "../people/PeopleSelect";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const getQuickDateOption = (option: 'today' | 'yesterday' | 'tomorrow') => {
    const today = new Date();
    let targetDate = new Date();
    
    switch (option) {
      case 'yesterday':
        targetDate.setDate(today.getDate() - 1);
        break;
      case 'tomorrow':
        targetDate.setDate(today.getDate() + 1);
        break;
      case 'today':
      default:
        targetDate = today;
        break;
    }
    
    const dateStr = targetDate.toISOString().split('T')[0];
    return { start: dateStr, end: dateStr };
  };

  const handleQuickDateFilter = (option: 'today' | 'yesterday' | 'tomorrow') => {
    const dateRange = getQuickDateOption(option);
    onFiltersChange({
      ...currentFilters,
      dateRange
    });
  };

  const handleDateRangeChange = (dateRange: { start: string; end: string } | undefined) => {
    onFiltersChange({
      ...currentFilters,
      dateRange
    });
  };

  const handleTypeFilter = (type: TaskType) => {
    const currentTypes = currentFilters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({
      ...currentFilters,
      type: newTypes.length > 0 ? newTypes : undefined
    });
  };

  const handlePriorityFilter = (priority: TaskPriority) => {
    const currentPriorities = currentFilters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFiltersChange({
      ...currentFilters,
      priority: newPriorities.length > 0 ? newPriorities : undefined
    });
  };

  const handleStatusFilter = (status: TaskStatus) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...currentFilters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handlePersonFilter = (personId: string) => {
    onFiltersChange({
      ...currentFilters,
      assignedPersonId: personId || undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        start: getCurrentDateInSaoPaulo(),
        end: getCurrentDateInSaoPaulo()
      }
    });
  };

  const hasActiveFilters = !!(
    currentFilters.type?.length ||
    currentFilters.priority?.length ||
    currentFilters.status?.length ||
    currentFilters.assignedPersonId
  );

  return (
    <Card className="max-h-20 overflow-hidden">
      <CardContent className="p-3 space-y-2">
        {/* Linha 1: Filtros de data rápidos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('yesterday')}
              >
                Ontem
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('today')}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('tomorrow')}
              >
                Amanhã
              </Button>
            </div>
            
            <DateRangePicker
              dateRange={currentFilters.dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-6 px-2 py-0 text-xs gap-1"
            >
              <Filter className="h-3 w-3" />
              Filtros
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 py-0 text-xs gap-1"
              >
                <X className="h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Linha 2: Filtros expandidos (quando showFilters é true) */}
        {showFilters && (
          <div className="flex items-center gap-4 pt-1 border-t">
            {/* Tipos */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Tipo:</span>
              <div className="flex gap-1">
                {(['task', 'routine', 'appointment'] as TaskType[]).map((type) => (
                  <Badge
                    key={type}
                    variant={currentFilters.type?.includes(type) ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handleTypeFilter(type)}
                  >
                    {type === 'task' ? 'Tarefa' : type === 'routine' ? 'Rotina' : 'Compromisso'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prioridades */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Prioridade:</span>
              <div className="flex gap-1">
                {(['high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                  <Badge
                    key={priority}
                    variant={currentFilters.priority?.includes(priority) ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handlePriorityFilter(priority)}
                  >
                    {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Status:</span>
              <div className="flex gap-1">
                {(['pending', 'completed', 'not-done'] as TaskStatus[]).map((status) => (
                  <Badge
                    key={status}
                    variant={currentFilters.status?.includes(status) ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handleStatusFilter(status)}
                  >
                    {status === 'pending' ? 'Pendente' : status === 'completed' ? 'Feito' : 'Não Feito'}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pessoa */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Pessoa:</span>
              <PeopleSelect
                value={currentFilters.assignedPersonId || ''}
                onChange={handlePersonFilter}
                placeholder="Todas"
                className="h-6 text-xs"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
