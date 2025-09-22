import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SkillFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  availableAreas: string[];
}

export function SkillFilters({
  searchQuery,
  onSearchChange,
  selectedArea,
  onAreaChange,
  availableAreas
}: SkillFiltersProps) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar habilidades..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedArea === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onAreaChange('')}
        >
          Todas as áreas
        </Button>
        
        {availableAreas.map((area) => (
          <Badge
            key={area}
            variant={selectedArea === area ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary/80 px-3 py-1"
            onClick={() => onAreaChange(selectedArea === area ? '' : area)}
          >
            {area}
            {selectedArea === area && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}