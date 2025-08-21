import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Filter, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { TaskFilter, TaskPriority, TaskType } from "@/types";

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

const taskTypes = [
  { value: 'meeting', label: 'Reunião' },
  { value: 'own-task', label: 'Própria' },
  { value: 'delegated-task', label: 'Delegada' }
];

const priorities = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'priority', label: 'Prioridade' },
  { value: 'extreme', label: 'Extrema' }
];

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    const newFilters = { ...currentFilters };
    
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const handleTypeChange = (type: TaskType) => {
    let newTypes = currentFilters.type ? [...currentFilters.type] : [];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined);
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    let newPriorities = currentFilters.priority ? [...currentFilters.priority] : [];
    if (newPriorities.includes(priority)) {
      newPriorities = newPriorities.filter(p => p !== priority);
    } else {
      newPriorities.push(priority);
    }
    handleFilterChange('priority', newPriorities.length > 0 ? newPriorities : undefined);
  };

  const handleConclusionChange = (value: string) => {
    if (value === 'all') {
      handleFilterChange('isConcluded', undefined);
      handleFilterChange('status', undefined);
    } else if (value === 'not-done') {
      // Filtrar tarefas que têm status "not-done" no histórico de conclusão
      handleFilterChange('status', ['not-done']);
      handleFilterChange('isConcluded', undefined);
    } else if (value === 'concluded') {
      handleFilterChange('isConcluded', true);
      handleFilterChange('status', undefined);
    } else if (value === 'not-concluded') {
      handleFilterChange('isConcluded', false);
      handleFilterChange('status', undefined);
    }
  };

  const handleTimeInvestmentChange = (time: string) => {
    let newTimes = currentFilters.timeInvestment ? [...currentFilters.timeInvestment] : [];
    if (newTimes.includes(time as 'low' | 'medium' | 'high')) {
      newTimes = newTimes.filter(t => t !== time);
    } else {
      newTimes.push(time as 'low' | 'medium' | 'high');
    }
    handleFilterChange('timeInvestment', newTimes.length > 0 ? newTimes : undefined);
  };

  const handleCategoryChange = (category: string) => {
    let newCategories = currentFilters.category ? [...currentFilters.category] : [];
    if (newCategories.includes(category as 'personal' | 'business')) {
      newCategories = newCategories.filter(c => c !== category);
    } else {
      newCategories.push(category as 'personal' | 'business');
    }
    handleFilterChange('category', newCategories.length > 0 ? newCategories : undefined);
  };

  const handleHasChecklistChange = (checked: boolean) => {
    handleFilterChange('hasChecklist', checked);
  };

  const handleIsForwardedChange = (checked: boolean) => {
    handleFilterChange('isForwarded', checked);
  };

  const handleNoOrderChange = (checked: boolean) => {
    handleFilterChange('noOrder', checked);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Período</Label>
          {currentFilters.dateRange && (
            <DateRangePicker
              startDate={currentFilters.dateRange.start}
              endDate={currentFilters.dateRange.end}
              onStartDateChange={(date) => handleFilterChange('dateRange', { ...currentFilters.dateRange, start: date })}
              onEndDateChange={(date) => handleFilterChange('dateRange', { ...currentFilters.dateRange, end: date })}
            />
          )}
        </div>

        {/* Type Filter */}
        <div className="space-y-3">
          <Label>Tipo de Tarefa</Label>
          <div className="grid grid-cols-1 gap-2">
            {taskTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={currentFilters.type?.includes(type.value as TaskType) || false}
                  onCheckedChange={() => handleTypeChange(type.value as TaskType)}
                />
                <Label htmlFor={`type-${type.value}`} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label>Prioridade</Label>
          <div className="grid grid-cols-1 gap-2">
            {priorities.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={currentFilters.priority?.includes(priority.value as TaskPriority) || false}
                  onCheckedChange={() => handlePriorityChange(priority.value as TaskPriority)}
                />
                <Label htmlFor={`priority-${priority.value}`} className="text-sm font-normal">
                  {priority.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <RadioGroup
            value={
              currentFilters.status?.includes('not-done') ? 'not-done' :
              currentFilters.isConcluded === true ? 'concluded' :
              currentFilters.isConcluded === false ? 'not-concluded' : 
              'all'
            }
            onValueChange={handleConclusionChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="text-sm font-normal">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-done" id="status-not-done" />
              <Label htmlFor="status-not-done" className="text-sm font-normal">Não feito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="concluded" id="status-concluded" />
              <Label htmlFor="status-concluded" className="text-sm font-normal">Concluído</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-concluded" id="status-not-concluded" />
              <Label htmlFor="status-not-concluded" className="text-sm font-normal">Não concluído</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Time Investment Filter */}
        <div className="space-y-3">
          <Label>Tempo Estimado</Label>
          <div className="grid grid-cols-1 gap-2">
            {['low', 'medium', 'high'].map((time) => (
              <div key={time} className="flex items-center space-x-2">
                <Checkbox
                  id={`time-${time}`}
                  checked={currentFilters.timeInvestment?.includes(time as 'low' | 'medium' | 'high') || false}
                  onCheckedChange={() => handleTimeInvestmentChange(time)}
                />
                <Label htmlFor={`time-${time}`} className="text-sm font-normal">
                  {time === 'low' ? 'Até 5min' : time === 'medium' ? 'Até 1h' : 'Até 2h'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <Label>Categoria</Label>
          <div className="grid grid-cols-1 gap-2">
            {['personal', 'business'].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={currentFilters.category?.includes(category as 'personal' | 'business') || false}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                  {category === 'personal' ? 'Pessoal' : 'Profissional'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Has Checklist Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-checklist"
              checked={currentFilters.hasChecklist === true}
              onCheckedChange={handleHasChecklistChange}
            />
            <Label htmlFor="has-checklist" className="text-sm font-normal">
              Possui Checklist
            </Label>
          </div>
        </div>

        {/* Is Forwarded Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-forwarded"
              checked={currentFilters.isForwarded === true}
              onCheckedChange={handleIsForwardedChange}
            />
            <Label htmlFor="is-forwarded" className="text-sm font-normal">
              Reagendada
            </Label>
          </div>
        </div>

        {/* No Order Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-order"
              checked={currentFilters.noOrder === true}
              onCheckedChange={handleNoOrderChange}
            />
            <Label htmlFor="no-order" className="text-sm font-normal">
              Sem Ordem
            </Label>
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full"
          disabled={Object.keys(currentFilters).length === 0}
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </CardContent>
    </Card>
  );
}
