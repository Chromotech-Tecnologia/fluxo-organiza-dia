import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useSupabaseSkills } from "@/hooks/useSupabaseSkills";

interface PeopleFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status?: string;
    skill?: string;
    project?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function PeopleFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange
}: PeopleFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { skills } = useSupabaseSkills();

  const handleFilterChange = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value
    });
  };

  const clearFilters = () => {
    onSearchChange("");
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Busca principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar em pessoas e membros da equipe..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {(searchQuery || activeFilterCount > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar tudo
            </Button>
          )}
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Filtro por Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Skill */}
            <div>
              <label className="text-sm font-medium mb-2 block">Habilidade</label>
              <Select
                value={filters.skill || "all"}
                onValueChange={(value) => handleFilterChange("skill", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as habilidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as habilidades</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Projeto */}
            <div>
              <label className="text-sm font-medium mb-2 block">Projeto</label>
              <Select
                value={filters.project || "all"}
                onValueChange={(value) => handleFilterChange("project", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  <SelectItem value="projeto-a">Projeto A</SelectItem>
                  <SelectItem value="projeto-b">Projeto B</SelectItem>
                  <SelectItem value="projeto-c">Projeto C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Filtros ativos */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.status && (
              <Badge variant="outline" className="gap-1">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("status", undefined)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.skill && (
              <Badge variant="outline" className="gap-1">
                Skill: {skills.find(s => s.id === filters.skill)?.name || filters.skill}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("skill", undefined)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.project && (
              <Badge variant="outline" className="gap-1">
                Projeto: {filters.project}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("project", undefined)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}