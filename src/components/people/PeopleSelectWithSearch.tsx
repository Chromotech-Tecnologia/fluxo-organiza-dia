import { useState } from 'react';
import { Search, User, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";

interface PeopleSelectWithSearchProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PeopleSelectWithSearch({ value, onValueChange, placeholder = "Selecione uma pessoa", disabled = false }: PeopleSelectWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { people, loading: loadingPeople } = useSupabasePeople();
  const { teamMembers, loading: loadingTeamMembers } = useSupabaseTeamMembers({ status: 'ativo' });

  const isLoading = loadingPeople || loadingTeamMembers;

  // Combinar pessoas e membros da equipe
  const allOptions = [
    ...people.map(person => ({
      id: person.id,
      name: person.name,
      role: person.role,
      type: 'person' as const,
      icon: User
    })),
    ...teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      type: 'team' as const,
      icon: Users
    }))
  ];

  // Filtrar por termo de busca
  const filteredOptions = allOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.role && option.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value || "unassigned"} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={disabled ? "Disponível apenas para tarefas delegadas" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoa..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <SelectItem value="unassigned">Nenhuma pessoa</SelectItem>
        
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-3 w-3 ${option.type === 'person' ? 'text-blue-500' : 'text-green-500'}`} />
                  <span>{option.name}</span>
                  {option.role && <span className="text-xs text-muted-foreground">({option.role})</span>}
                </div>
              </SelectItem>
            );
          })
        ) : searchTerm ? (
          <SelectItem value="no-results" disabled>
            Nenhum resultado encontrado para "{searchTerm}"
          </SelectItem>
        ) : (
          <SelectItem value="no-options" disabled>
            Nenhuma pessoa ou membro encontrado
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}