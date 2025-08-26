
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, Calendar, User, Filter } from "lucide-react";
import { TaskFilter } from '@/types';
import { SORT_OPTIONS } from '@/lib/taskUtils';

interface TaskFiltersHorizontalProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  showDateFilter?: boolean;
  showPersonFilter?: boolean;
  activeFiltersCount: number;
}

export function TaskFiltersHorizontal({
  filters,
  onFiltersChange,
  showDateFilter = true,
  showPersonFilter = true,
  activeFiltersCount
}: TaskFiltersHorizontalProps) {
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

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-6 items-center">
          {/* Search Filter */}
          <div className="md:col-span-2">
            <Input
              type="search"
              placeholder="Buscar tarefa..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Priority Filter */}
          <div>
            <Select onValueChange={(value) => onFiltersChange({ ...filters, priority: value === 'all' ? undefined : [value as any] })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : [value as any] })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="not-done">Não Feita</SelectItem>
                <SelectItem value="rescheduled">Reagendada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div>
            <Select onValueChange={(value) => {
              // Handle sort change logic here
            }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Ordenar por" />
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

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2">{activeFiltersCount}</Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
