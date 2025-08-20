
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePeople } from "@/hooks/usePeople";
import { TaskFilter, TaskStatus, TaskType, TaskCategory, TaskPriority, TaskTimeInvestment } from "@/types";
import { getCurrentDateInSaoPaulo, getYesterdayInSaoPaulo, getTomorrowInSaoPaulo } from "@/lib/utils";

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilter) => void;
  currentFilters: TaskFilter;
}

export function TaskFilters({ onFiltersChange, currentFilters }: TaskFiltersProps) {
  const { people } = usePeople();

  const applyFilters = (newFilters: TaskFilter) => {
    onFiltersChange({ ...newFilters });
  };

  const clearFilters = () => {
    const emptyFilters: TaskFilter = {};
    onFiltersChange(emptyFilters);
  };

  const getFilterCount = () => {
    let count = 0;
    if (currentFilters.dateRange) count++;
    if (currentFilters.type?.length) count++;
    if (currentFilters.status?.length) count++;
    if (currentFilters.assignedPersonId) count++;
    if (currentFilters.priority?.length) count++;
    if (currentFilters.timeInvestment?.length) count++;
    if (currentFilters.hasSubItems !== undefined) count++;
    if (currentFilters.hasForwards !== undefined) count++;
    if (currentFilters.isRoutine !== undefined) count++;
    if (currentFilters.isDefinitive !== undefined) count++;
    if (currentFilters.notForwarded !== undefined) count++;
    if (currentFilters.noOrder !== undefined) count++;
    return count;
  };

  const setDateFilter = (type: 'today' | 'yesterday' | 'tomorrow') => {
    let dateRange;
    switch (type) {
      case 'today':
        const today = getCurrentDateInSaoPaulo();
        dateRange = { start: today, end: today };
        break;
      case 'yesterday':
        const yesterday = getYesterdayInSaoPaulo();
        dateRange = { start: yesterday, end: yesterday };
        break;
      case 'tomorrow':
        const tomorrow = getTomorrowInSaoPaulo();
        dateRange = { start: tomorrow, end: tomorrow };
        break;
    }
    applyFilters({ ...currentFilters, dateRange });
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    const currentStatus = currentFilters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    applyFilters({ ...currentFilters, status: newStatus });
  };

  const toggleTypeFilter = (type: TaskType) => {
    const currentType = currentFilters.type || [];
    const newType = currentType.includes(type)
      ? currentType.filter(t => t !== type)
      : [...currentType, type];
    applyFilters({ ...currentFilters, type: newType });
  };

  const togglePriorityFilter = (priority: TaskPriority) => {
    const currentPriority = currentFilters.priority || [];
    const newPriority = currentPriority.includes(priority)
      ? currentPriority.filter(p => p !== priority)
      : [...currentPriority, priority];
    applyFilters({ ...currentFilters, priority: newPriority });
  };

  const toggleTimeInvestmentFilter = (timeInvestment: TaskTimeInvestment) => {
    const currentTimeInvestment = currentFilters.timeInvestment || [];
    const newTimeInvestment = currentTimeInvestment.includes(timeInvestment)
      ? currentTimeInvestment.filter(t => t !== timeInvestment)
      : [...currentTimeInvestment, timeInvestment];
    applyFilters({ ...currentFilters, timeInvestment: newTimeInvestment });
  };

  const toggleBooleanFilter = (key: keyof TaskFilter, value?: boolean) => {
    const newValue = currentFilters[key] === value ? undefined : value;
    applyFilters({ ...currentFilters, [key]: newValue });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtros</span>
            {getFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">{getFilterCount()}</Badge>
            )}
          </div>

          {/* Filtros de Data Rápidos */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === getYesterdayInSaoPaulo() ? "default" : "outline"}
              onClick={() => setDateFilter('yesterday')}
              className="h-7 px-2 text-xs"
            >
              Ontem
            </Button>
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === getCurrentDateInSaoPaulo() ? "default" : "outline"}
              onClick={() => setDateFilter('today')}
              className="h-7 px-2 text-xs"
            >
              Hoje
            </Button>
            <Button
              size="sm"
              variant={currentFilters.dateRange?.start === getTomorrowInSaoPaulo() ? "default" : "outline"}
              onClick={() => setDateFilter('tomorrow')}
              className="h-7 px-2 text-xs"
            >
              Amanhã
            </Button>
          </div>

          {/* Data Início/Fim */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              placeholder="Início"
              value={currentFilters.dateRange?.start || ''}
              onChange={(e) => applyFilters({
                ...currentFilters,
                dateRange: { 
                  start: e.target.value, 
                  end: currentFilters.dateRange?.end || e.target.value 
                }
              })}
              className="h-7 text-xs w-28"
            />
            <Input
              type="date"
              placeholder="Fim"
              value={currentFilters.dateRange?.end || ''}
              onChange={(e) => applyFilters({
                ...currentFilters,
                dateRange: { 
                  start: currentFilters.dateRange?.start || e.target.value, 
                  end: e.target.value 
                }
              })}
              className="h-7 text-xs w-28"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.status?.includes('completed') ? "default" : "outline"}
              onClick={() => toggleStatusFilter('completed')}
              className="h-7 px-2 text-xs"
            >
              Feito
            </Button>
            <Button
              size="sm"
              variant={currentFilters.status?.includes('not-done') ? "default" : "outline"}
              onClick={() => toggleStatusFilter('not-done')}
              className="h-7 px-2 text-xs"
            >
              Não Feito
            </Button>
            <Button
              size="sm"
              variant={currentFilters.status?.includes('pending') ? "default" : "outline"}
              onClick={() => toggleStatusFilter('pending')}
              className="h-7 px-2 text-xs"
            >
              Pendente
            </Button>
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.type?.includes('own-task') ? "default" : "outline"}
              onClick={() => toggleTypeFilter('own-task')}
              className="h-7 px-2 text-xs"
            >
              Própria
            </Button>
            <Button
              size="sm"
              variant={currentFilters.type?.includes('delegated-task') ? "default" : "outline"}
              onClick={() => toggleTypeFilter('delegated-task')}
              className="h-7 px-2 text-xs"
            >
              Delegada
            </Button>
            <Button
              size="sm"
              variant={currentFilters.type?.includes('meeting') ? "default" : "outline"}
              onClick={() => toggleTypeFilter('meeting')}
              className="h-7 px-2 text-xs"
            >
              Reunião
            </Button>
          </div>

          {/* Prioridade */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.priority?.includes('none') ? "default" : "outline"}
              onClick={() => togglePriorityFilter('none')}
              className="h-7 px-2 text-xs"
            >
              Sem Prioridade
            </Button>
            <Button
              size="sm"
              variant={currentFilters.priority?.includes('priority') ? "default" : "outline"}
              onClick={() => togglePriorityFilter('priority')}
              className="h-7 px-2 text-xs"
            >
              Prioridade
            </Button>
            <Button
              size="sm"
              variant={currentFilters.priority?.includes('extreme') ? "default" : "outline"}
              onClick={() => togglePriorityFilter('extreme')}
              className="h-7 px-2 text-xs"
            >
              Extrema
            </Button>
          </div>

          {/* Tempo Investido */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.timeInvestment?.includes('low') ? "default" : "outline"}
              onClick={() => toggleTimeInvestmentFilter('low')}
              className="h-7 px-2 text-xs"
            >
              Baixo
            </Button>
            <Button
              size="sm"
              variant={currentFilters.timeInvestment?.includes('medium') ? "default" : "outline"}
              onClick={() => toggleTimeInvestmentFilter('medium')}
              className="h-7 px-2 text-xs"
            >
              Médio
            </Button>
            <Button
              size="sm"
              variant={currentFilters.timeInvestment?.includes('high') ? "default" : "outline"}
              onClick={() => toggleTimeInvestmentFilter('high')}
              className="h-7 px-2 text-xs"
            >
              Alto
            </Button>
          </div>

          {/* Categoria */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.category?.includes('personal' as TaskCategory) ? "default" : "outline"}
              onClick={() => {
                const category = currentFilters.category || [];
                const newCategory = category.includes('personal' as TaskCategory)
                  ? category.filter(c => c !== 'personal')
                  : [...category, 'personal' as TaskCategory];
                applyFilters({ ...currentFilters, category: newCategory });
              }}
              className="h-7 px-2 text-xs"
            >
              Pessoal
            </Button>
          </div>

          {/* Filtros Especiais */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentFilters.hasSubItems ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('hasSubItems', true)}
              className="h-7 px-2 text-xs"
            >
              Com Checklist
            </Button>
            <Button
              size="sm"
              variant={currentFilters.hasForwards ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('hasForwards', true)}
              className="h-7 px-2 text-xs"
            >
              Repasses
            </Button>
            <Button
              size="sm"
              variant={currentFilters.isRoutine ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('isRoutine', true)}
              className="h-7 px-2 text-xs"
            >
              Rotina
            </Button>
            <Button
              size="sm"
              variant={currentFilters.isDefinitive ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('isDefinitive', true)}
              className="h-7 px-2 text-xs"
            >
              Definitivo
            </Button>
            <Button
              size="sm"
              variant={currentFilters.notForwarded ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('notForwarded', true)}
              className="h-7 px-2 text-xs"
            >
              Não Repassadas
            </Button>
            <Button
              size="sm"
              variant={currentFilters.noOrder ? "default" : "outline"}
              onClick={() => toggleBooleanFilter('noOrder', true)}
              className="h-7 px-2 text-xs"
            >
              Sem Ordem
            </Button>
          </div>

          {/* Equipe */}
          <Select
            value={currentFilters.assignedPersonId || ""}
            onValueChange={(value) => applyFilters({
              ...currentFilters,
              assignedPersonId: value === "all" ? undefined : value
            })}
          >
            <SelectTrigger className="h-7 text-xs w-32">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {people.map(person => (
                <SelectItem key={person.id} value={person.id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão de Limpar */}
          <Button onClick={clearFilters} variant="outline" size="sm" className="h-7 px-2 text-xs">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
