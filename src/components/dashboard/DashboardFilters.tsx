
import { Card, CardContent } from "@/components/ui/card";
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { TaskFilter, SortOption } from "@/types";

interface DashboardFiltersProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

export function DashboardFilters({ 
  filters, 
  onFiltersChange,
  searchQuery = "",
  onSearchChange = () => {},
  sortBy = "order",
  onSortChange = () => {}
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <TaskFiltersHorizontal
          currentFilters={filters}
          onFiltersChange={onFiltersChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </CardContent>
    </Card>
  );
}
