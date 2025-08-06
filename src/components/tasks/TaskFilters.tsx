import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePeople } from "@/hooks/usePeople";
import { TaskFilter, TaskStatus, TaskType } from "@/types";
import { getCurrentDateInSaoPaulo, getYesterdayInSaoPaulo, getTomorrowInSaoPaulo } from "@/lib/utils";

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilter) => void;
  currentFilters: TaskFilter;
}

export function TaskFilters({ onFiltersChange, currentFilters }: TaskFiltersProps) {
  const { people } = usePeople();
  const [tempFilters, setTempFilters] = useState<TaskFilter>(currentFilters);

  const applyFilters = () => {
    onFiltersChange({ ...tempFilters });
  };

  const clearFilters = () => {
    const emptyFilters: TaskFilter = {};
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getFilterCount = () => {
    let count = 0;
    if (tempFilters.dateRange) count++;
    if (tempFilters.type?.length) count++;
    if (tempFilters.status?.length) count++;
    if (tempFilters.assignedPersonId) count++;
    if (tempFilters.priority?.length) count++;
    return count;
  };

  const setDateFilter = (type: 'today' | 'yesterday' | 'tomorrow') => {
    let dateRange;
    switch (type) {
      case 'today':
        const today = getCurrentDateInSaoPaulo();
        console.log('Filtro Hoje aplicado:', today);
        dateRange = { start: today, end: today };
        break;
      case 'yesterday':
        const yesterday = getYesterdayInSaoPaulo();
        console.log('Filtro Ontem aplicado:', yesterday);
        dateRange = { start: yesterday, end: yesterday };
        break;
      case 'tomorrow':
        const tomorrow = getTomorrowInSaoPaulo();
        console.log('Filtro Amanhã aplicado:', tomorrow);
        dateRange = { start: tomorrow, end: tomorrow };
        break;
    }
    setTempFilters({ ...tempFilters, dateRange });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        {/* Linha única compacta de filtros */}
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
              variant={tempFilters.dateRange?.start === getYesterdayInSaoPaulo() ? "default" : "outline"}
              onClick={() => setDateFilter('yesterday')}
              className="h-7 px-2 text-xs"
            >
              Ontem
            </Button>
            <Button
              size="sm"
              variant={tempFilters.dateRange?.start === getCurrentDateInSaoPaulo() ? "default" : "outline"}
              onClick={() => setDateFilter('today')}
              className="h-7 px-2 text-xs"
            >
              Hoje
            </Button>
            <Button
              size="sm"
              variant={tempFilters.dateRange?.start === getTomorrowInSaoPaulo() ? "default" : "outline"}
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
              value={tempFilters.dateRange?.start || ''}
              onChange={(e) => setTempFilters({
                ...tempFilters,
                dateRange: { 
                  start: e.target.value, 
                  end: tempFilters.dateRange?.end || e.target.value 
                }
              })}
              className="h-7 text-xs w-28"
            />
            <Input
              type="date"
              placeholder="Fim"
              value={tempFilters.dateRange?.end || ''}
              onChange={(e) => setTempFilters({
                ...tempFilters,
                dateRange: { 
                  start: tempFilters.dateRange?.start || e.target.value, 
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
              variant={tempFilters.status?.includes('completed') ? "default" : "outline"}
              onClick={() => {
                const status = tempFilters.status || [];
                const newStatus = status.includes('completed' as TaskStatus)
                  ? status.filter(s => s !== 'completed')
                  : [...status, 'completed' as TaskStatus];
                setTempFilters({ ...tempFilters, status: newStatus });
              }}
              className="h-7 px-2 text-xs"
            >
              Feito
            </Button>
            <Button
              size="sm"
              variant={tempFilters.status?.includes('not-done') ? "default" : "outline"}
              onClick={() => {
                const status = tempFilters.status || [];
                const newStatus = status.includes('not-done' as TaskStatus)
                  ? status.filter(s => s !== 'not-done')
                  : [...status, 'not-done' as TaskStatus];
                setTempFilters({ ...tempFilters, status: newStatus });
              }}
              className="h-7 px-2 text-xs"
            >
              Não Feito
            </Button>
            <Button
              size="sm"
              variant={tempFilters.status?.includes('pending') ? "default" : "outline"}
              onClick={() => {
                const status = tempFilters.status || [];
                const newStatus = status.includes('pending' as TaskStatus)
                  ? status.filter(s => s !== 'pending')
                  : [...status, 'pending' as TaskStatus];
                setTempFilters({ ...tempFilters, status: newStatus });
              }}
              className="h-7 px-2 text-xs"
            >
              Pendente
            </Button>
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={tempFilters.type?.includes('own-task') ? "default" : "outline"}
              onClick={() => {
                const type = tempFilters.type || [];
                const newType = type.includes('own-task' as TaskType)
                  ? type.filter(t => t !== 'own-task')
                  : [...type, 'own-task' as TaskType];
                setTempFilters({ ...tempFilters, type: newType });
              }}
              className="h-7 px-2 text-xs"
            >
              Própria
            </Button>
            <Button
              size="sm"
              variant={tempFilters.type?.includes('delegated-task') ? "default" : "outline"}
              onClick={() => {
                const type = tempFilters.type || [];
                const newType = type.includes('delegated-task' as TaskType)
                  ? type.filter(t => t !== 'delegated-task')
                  : [...type, 'delegated-task' as TaskType];
                setTempFilters({ ...tempFilters, type: newType });
              }}
              className="h-7 px-2 text-xs"
            >
              Delegada
            </Button>
            <Button
              size="sm"
              variant={tempFilters.type?.includes('meeting') ? "default" : "outline"}
              onClick={() => {
                const type = tempFilters.type || [];
                const newType = type.includes('meeting' as TaskType)
                  ? type.filter(t => t !== 'meeting')
                  : [...type, 'meeting' as TaskType];
                setTempFilters({ ...tempFilters, type: newType });
              }}
              className="h-7 px-2 text-xs"
            >
              Reunião
            </Button>
          </div>

          {/* Equipe */}
          <Select
            value={tempFilters.assignedPersonId || ""}
            onValueChange={(value) => setTempFilters({
              ...tempFilters,
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

          {/* Botões de Ação */}
          <div className="flex gap-1">
            <Button onClick={applyFilters} size="sm" className="h-7 px-2 text-xs">
              Aplicar
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm" className="h-7 px-2 text-xs">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}