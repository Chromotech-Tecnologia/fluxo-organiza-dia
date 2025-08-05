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
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
          {getFilterCount() > 0 && (
            <Badge variant="secondary">{getFilterCount()}</Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Filtros de Data Rápidos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={tempFilters.dateRange?.start === getCurrentDateInSaoPaulo() ? "default" : "outline"}
                onClick={() => setDateFilter('today')}
              >
                Hoje
              </Button>
              <Button
                size="sm"
                variant={tempFilters.dateRange?.start === getYesterdayInSaoPaulo() ? "default" : "outline"}
                onClick={() => setDateFilter('yesterday')}
              >
                Ontem
              </Button>
              <Button
                size="sm"
                variant={tempFilters.dateRange?.start === getTomorrowInSaoPaulo() ? "default" : "outline"}
                onClick={() => setDateFilter('tomorrow')}
              >
                Amanhã
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Data início"
                value={tempFilters.dateRange?.start || ''}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  dateRange: { 
                    start: e.target.value, 
                    end: tempFilters.dateRange?.end || e.target.value 
                  }
                })}
              />
              <Input
                type="date"
                placeholder="Data fim"
                value={tempFilters.dateRange?.end || ''}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  dateRange: { 
                    start: tempFilters.dateRange?.start || e.target.value, 
                    end: e.target.value 
                  }
                })}
              />
            </div>
          </div>

          {/* Filtros de Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-2 flex-wrap">
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
              >
                Pendente
              </Button>
            </div>
          </div>

          {/* Filtros de Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <div className="flex gap-2 flex-wrap">
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
              >
                Reunião
              </Button>
            </div>
          </div>

          {/* Filtro de Equipe */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Equipe Delegada</label>
            <Select
              value={tempFilters.assignedPersonId || ""}
              onValueChange={(value) => setTempFilters({
                ...tempFilters,
                assignedPersonId: value === "all" ? undefined : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as equipes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as equipes</SelectItem>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} - {person.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters} size="sm">
              Aplicar Filtros
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}