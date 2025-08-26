
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, Search, Calendar, User, Filter, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { TaskFilter } from '@/types';
import { PersonTeamSelect } from '@/components/people/PersonTeamSelect';

interface TaskFiltersImprovedProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  showDateFilter?: boolean;
  showPersonFilter?: boolean;
  activeFiltersCount: number;
}

export function TaskFiltersImproved({
  filters,
  onFiltersChange,
  showDateFilter = true,
  showPersonFilter = true,
  activeFiltersCount
}: TaskFiltersImprovedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      priority: undefined,
      status: undefined,
      category: undefined,
      type: undefined,
      assignedPersonId: undefined,
      dateRange: undefined
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handlePriorityChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, priority: value ? [value as any] : undefined });
  };

  const handleStatusChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, status: value ? [value as any] : undefined });
  };

  const handleCategoryChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, category: value ? [value as any] : undefined });
  };

  const handleTypeChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, type: value ? [value as any] : undefined });
  };

  const handlePersonChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, assignedPersonId: value });
  };

  const activeFilters = Object.keys(filters).filter(key => {
    const filterKey = key as keyof TaskFilter;
    const filterValue = filters[filterKey];

    if (filterKey === 'search' && filterValue) return true;
    if (filterKey === 'priority' && filterValue) return true;
    if (filterKey === 'status' && filterValue) return true;
    if (filterKey === 'category' && filterValue) return true;
    if (filterKey === 'type' && filterValue) return true;
    if (filterKey === 'assignedPersonId' && filterValue) return true;
    if (filterKey === 'dateRange' && filterValue) return true;

    return false;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  Filtros {activeFiltersCount > 0 && <Badge className="ml-2">{activeFiltersCount}</Badge>}
                  {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
          <CollapsibleContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {/* Search */}
              <div>
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Priority */}
              <div>
                <Select value={filters.priority?.[0] || undefined} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Select value={filters.status?.[0] || undefined} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="not-done">Não Feita</SelectItem>
                    <SelectItem value="rescheduled">Reagendada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <Select value={filters.category?.[0] || undefined} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="study">Estudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <Select value={filters.type?.[0] || undefined} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="call">Ligação</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned Person */}
              {showPersonFilter && (
                <div>
                  <PersonTeamSelect
                    value={filters.assignedPersonId || undefined}
                    onValueChange={handlePersonChange}
                    placeholder="Pessoa / Equipe"
                  />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
