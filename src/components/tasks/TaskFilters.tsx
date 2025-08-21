
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, X, Filter } from "lucide-react";
import { TaskFilter, TaskType, TaskPriority, TaskStatus } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { PeopleSelect } from "../people/PeopleSelect";
import { getCurrentDateInSaoPaulo, getYesterdayInSaoPaulo, getTomorrowInSaoPaulo } from "@/lib/utils";

interface TaskFiltersProps {
  currentFilters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ currentFilters, onFiltersChange }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateButton, setSelectedDateButton] = useState<'yesterday' | 'today' | 'tomorrow' | null>(null);

  const getQuickDateOption = (option: 'today' | 'yesterday' | 'tomorrow') => {
    let dateStr = '';
    switch (option) {
      case 'yesterday':
        dateStr = getYesterdayInSaoPaulo();
        break;
      case 'tomorrow':
        dateStr = getTomorrowInSaoPaulo();
        break;
      case 'today':
      default:
        dateStr = getCurrentDateInSaoPaulo();
        break;
    }
    
    return { start: dateStr, end: dateStr };
  };

  const handleQuickDateFilter = (option: 'today' | 'yesterday' | 'tomorrow') => {
    const dateRange = getQuickDateOption(option);
    setSelectedDateButton(option);
    onFiltersChange({
      ...currentFilters,
      dateRange
    });
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    // Limpar seleção de botão rápido se usar date picker
    setSelectedDateButton(null);
    onFiltersChange({
      ...currentFilters,
      dateRange: { start: startDate, end: endDate }
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

  const handleTimeInvestmentFilter = (timeInvestment: 'low' | 'medium' | 'high') => {
    const currentTimeInvestments = currentFilters.timeInvestment || [];
    const newTimeInvestments = currentTimeInvestments.includes(timeInvestment)
      ? currentTimeInvestments.filter(t => t !== timeInvestment)
      : [...currentTimeInvestments, timeInvestment];
    
    onFiltersChange({
      ...currentFilters,
      timeInvestment: newTimeInvestments.length > 0 ? newTimeInvestments : undefined
    });
  };

  const handleCategoryFilter = (category: 'personal' | 'business') => {
    const currentCategories = currentFilters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({
      ...currentFilters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleChecklistFilter = (hasChecklist: boolean) => {
    onFiltersChange({
      ...currentFilters,
      hasChecklist: currentFilters.hasChecklist === hasChecklist ? undefined : hasChecklist
    });
  };

  const handleForwardedFilter = (isForwarded: boolean) => {
    onFiltersChange({
      ...currentFilters,
      isForwarded: currentFilters.isForwarded === isForwarded ? undefined : isForwarded
    });
  };

  const handleNoOrderFilter = (noOrder: boolean) => {
    onFiltersChange({
      ...currentFilters,
      noOrder: currentFilters.noOrder === noOrder ? undefined : noOrder
    });
  };

  const handleConclusionFilter = (isConcluded: boolean) => {
    onFiltersChange({
      ...currentFilters,
      isConcluded: currentFilters.isConcluded === isConcluded ? undefined : isConcluded
    });
  };

  const clearAllFilters = () => {
    setSelectedDateButton(null);
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
    currentFilters.assignedPersonId ||
    currentFilters.timeInvestment?.length ||
    currentFilters.category?.length ||
    currentFilters.hasChecklist !== undefined ||
    currentFilters.isForwarded !== undefined ||
    currentFilters.noOrder !== undefined ||
    currentFilters.isConcluded !== undefined
  );

  return (
    <Card className="max-h-20 overflow-visible">
      <CardContent className="p-3 space-y-2">
        {/* Linha 1: Filtros de data e status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={selectedDateButton === 'yesterday' ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('yesterday')}
              >
                Ontem
              </Button>
              <Button
                variant={selectedDateButton === 'today' ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('today')}
              >
                Hoje
              </Button>
              <Button
                variant={selectedDateButton === 'tomorrow' ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 py-0 text-xs"
                onClick={() => handleQuickDateFilter('tomorrow')}
              >
                Amanhã
              </Button>
            </div>
            
            <DateRangePicker
              startDate={currentFilters.dateRange?.start || getCurrentDateInSaoPaulo()}
              endDate={currentFilters.dateRange?.end || getCurrentDateInSaoPaulo()}
              onStartDateChange={(date) => handleDateRangeChange(date, currentFilters.dateRange?.end || getCurrentDateInSaoPaulo())}
              onEndDateChange={(date) => handleDateRangeChange(currentFilters.dateRange?.start || getCurrentDateInSaoPaulo(), date)}
            />

            {/* Status na primeira linha */}
            <div className="flex items-center gap-1 ml-4">
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

            {/* Filtros de Conclusão na primeira linha */}
            <div className="flex items-center gap-1 ml-4">
              <span className="text-xs text-muted-foreground">Conclusão:</span>
              <div className="flex gap-1">
                <Badge
                  variant={currentFilters.isConcluded === true ? "default" : "outline"}
                  className="h-5 px-2 text-xs cursor-pointer"
                  onClick={() => handleConclusionFilter(true)}
                >
                  Concluído
                </Badge>
                <Badge
                  variant={currentFilters.isConcluded === false ? "default" : "outline"}
                  className="h-5 px-2 text-xs cursor-pointer"
                  onClick={() => handleConclusionFilter(false)}
                >
                  Não Concluído
                </Badge>
              </div>
            </div>
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
          <div className="space-y-2 pt-1 border-t">
            {/* Primeira sublinha dos filtros expandidos */}
            <div className="flex items-center gap-4">
              {/* Tipos */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Tipo:</span>
                <div className="flex gap-1">
                  {(['meeting', 'own-task', 'delegated-task'] as TaskType[]).map((type) => (
                    <Badge
                      key={type}
                      variant={currentFilters.type?.includes(type) ? "default" : "outline"}
                      className="h-5 px-2 text-xs cursor-pointer"
                      onClick={() => handleTypeFilter(type)}
                    >
                      {type === 'meeting' ? 'Reunião' : type === 'own-task' ? 'Própria' : 'Delegada'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prioridades */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Prioridade:</span>
                <div className="flex gap-1">
                  {(['none', 'priority', 'extreme'] as TaskPriority[]).map((priority) => (
                    <Badge
                      key={priority}
                      variant={currentFilters.priority?.includes(priority) ? "default" : "outline"}
                      className="h-5 px-2 text-xs cursor-pointer"
                      onClick={() => handlePriorityFilter(priority)}
                    >
                      {priority === 'none' ? 'Nenhuma' : priority === 'priority' ? 'Prioridade' : 'Extrema'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pessoa */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Pessoa:</span>
                <div className="w-32">
                  <PeopleSelect
                    value={currentFilters.assignedPersonId || ''}
                    onChange={handlePersonFilter}
                    placeholder="Todas"
                  />
                </div>
              </div>
            </div>

            {/* Segunda sublinha dos filtros expandidos */}
            <div className="flex items-center gap-4">
              {/* Tempo Investido */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Tempo:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((time) => (
                    <Badge
                      key={time}
                      variant={currentFilters.timeInvestment?.includes(time) ? "default" : "outline"}
                      className="h-5 px-2 text-xs cursor-pointer"
                      onClick={() => handleTimeInvestmentFilter(time)}
                    >
                      {time === 'low' ? 'Baixo' : time === 'medium' ? 'Médio' : 'Alto'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Categoria */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Categoria:</span>
                <div className="flex gap-1">
                  {(['personal', 'business'] as const).map((category) => (
                    <Badge
                      key={category}
                      variant={currentFilters.category?.includes(category) ? "default" : "outline"}
                      className="h-5 px-2 text-xs cursor-pointer"
                      onClick={() => handleCategoryFilter(category)}
                    >
                      {category === 'personal' ? 'Pessoal' : 'Profissional'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filtros especiais */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Especiais:</span>
                <div className="flex gap-1">
                  <Badge
                    variant={currentFilters.hasChecklist === true ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handleChecklistFilter(true)}
                  >
                    Com Checklist
                  </Badge>
                  <Badge
                    variant={currentFilters.isForwarded === true ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handleForwardedFilter(true)}
                  >
                    Reagendadas
                  </Badge>
                  <Badge
                    variant={currentFilters.noOrder === true ? "default" : "outline"}
                    className="h-5 px-2 text-xs cursor-pointer"
                    onClick={() => handleNoOrderFilter(true)}
                  >
                    Sem Ordem
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
