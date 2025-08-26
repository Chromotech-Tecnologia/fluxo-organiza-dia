
import React from 'react';
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { TaskFilter, SortOption } from "@/types";

interface DashboardFiltersProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}: DashboardFiltersProps) {
  // Convert search query to filters format
  const filtersWithSearch = {
    ...filters,
    search: searchQuery
  };

  const handleFiltersChange = (newFilters: TaskFilter) => {
    // Extract search from filters and handle separately
    const { search, ...otherFilters } = newFilters;
    onFiltersChange(otherFilters);
    if (search !== undefined) {
      onSearchChange(search);
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const filterKey = key as keyof TaskFilter;
    const filterValue = filters[filterKey];
    if (Array.isArray(filterValue)) return filterValue.length > 0;
    return filterValue !== undefined && filterValue !== '';
  }).length + (searchQuery ? 1 : 0);

  return (
    <TaskFiltersHorizontal
      filters={filtersWithSearch}
      onFiltersChange={handleFiltersChange}
      activeFiltersCount={activeFiltersCount}
    />
  );
}
