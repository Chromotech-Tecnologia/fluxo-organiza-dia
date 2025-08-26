
import { Card, CardContent } from "@/components/ui/card";
import { TaskFiltersHorizontal } from "@/components/tasks/TaskFiltersHorizontal";
import { TaskFilter } from "@/types";

interface DashboardFiltersProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <TaskFiltersHorizontal
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </CardContent>
    </Card>
  );
}
