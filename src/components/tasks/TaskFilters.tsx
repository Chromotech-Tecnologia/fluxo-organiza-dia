
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "./DateRangePicker";
import { TaskFilter, TaskType, TaskPriority, TaskStatus } from "@/types";
import { X, Filter, Calendar } from "lucide-react";

interface TaskFiltersProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  onClearFilters: () => void;
}

export function TaskFilters({ filters, onFiltersChange, onClearFilters }: TaskFiltersProps) {
  
  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleMultiSelectChange = (key: keyof TaskFilter, value: string, checked: boolean) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return true;
    return value !== undefined && value !== '';
  }).length;

  // Handlers para o DateRangePicker
  const handleDateRangeChange = (dateRange: { start: string; end: string }) => {
    handleFilterChange('dateRange', dateRange);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtro de Data */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Período
          </label>
          <DateRangePicker
            dateRange={filters.dateRange || { start: '', end: '' }}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Filtros em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <div className="space-y-2">
              {[
                { value: 'meeting', label: 'Reunião' },
                { value: 'own-task', label: 'Própria' },
                { value: 'delegated-task', label: 'Delegada' }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${value}`}
                    checked={(filters.type || []).includes(value as TaskType)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('type', value, checked as boolean)
                    }
                  />
                  <label htmlFor={`type-${value}`} className="text-sm">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <div className="space-y-2">
              {[
                { value: 'extreme', label: 'Extrema' },
                { value: 'priority', label: 'Prioridade' },
                { value: 'none', label: 'Sem Prioridade' }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${value}`}
                    checked={(filters.priority || []).includes(value as TaskPriority)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('priority', value, checked as boolean)
                    }
                  />
                  <label htmlFor={`priority-${value}`} className="text-sm">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2">
              {[
                { value: 'pending', label: 'Pendente' },
                { value: 'completed', label: 'Feito' },
                { value: 'not-done', label: 'Não feito' }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${value}`}
                    checked={(filters.status || []).includes(value as TaskStatus)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('status', value, checked as boolean)
                    }
                  />
                  <label htmlFor={`status-${value}`} className="text-sm">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Processamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Processamento</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="processed-yes"
                  checked={filters.isProcessed === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isProcessed', checked ? true : undefined)
                  }
                />
                <label htmlFor="processed-yes" className="text-sm">Processada</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="processed-no"
                  checked={filters.isProcessed === false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isProcessed', checked ? false : undefined)
                  }
                />
                <label htmlFor="processed-no" className="text-sm">Não processada</label>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tempo de Investimento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tempo</label>
            <Select
              value={filters.timeInvestment?.[0] || "all"}
              onValueChange={(value) => 
                handleFilterChange('timeInvestment', value === "all" ? undefined : [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">5min</SelectItem>
                <SelectItem value="medium">1h</SelectItem>
                <SelectItem value="high">2h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={filters.category?.[0] || "all"}
              onValueChange={(value) => 
                handleFilterChange('category', value === "all" ? undefined : [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
                <SelectItem value="business">Negócios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reagendamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reagendamento</label>
            <Select
              value={filters.isForwarded === true ? "yes" : filters.isForwarded === false ? "no" : "all"}
              onValueChange={(value) => 
                handleFilterChange('isForwarded', value === "yes" ? true : value === "no" ? false : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Reagendada</SelectItem>
                <SelectItem value="no">Não reagendada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros Especiais */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-checklist"
              checked={filters.hasChecklist === true}
              onCheckedChange={(checked) => 
                handleFilterChange('hasChecklist', checked ? true : undefined)
              }
            />
            <label htmlFor="has-checklist" className="text-sm">Com checklist</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-order"
              checked={filters.noOrder === true}
              onCheckedChange={(checked) => 
                handleFilterChange('noOrder', checked ? true : undefined)
              }
            />
            <label htmlFor="no-order" className="text-sm">Sem ordem</label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
