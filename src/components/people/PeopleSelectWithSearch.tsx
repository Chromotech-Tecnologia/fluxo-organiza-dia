import { useState } from 'react';
import { Search, User, Users, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PeopleSelectWithSearchProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PeopleSelectWithSearch({ value, onValueChange, placeholder = "Selecione uma pessoa", disabled = false }: PeopleSelectWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { people, loading: loadingPeople } = useSupabasePeople();
  const { teamMembers, loading: loadingTeamMembers } = useSupabaseTeamMembers({ status: 'ativo' });

  const isLoading = loadingPeople || loadingTeamMembers;

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

  const filteredOptions = allOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.role && option.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = allOptions.find(o => o.id === value);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-between">
        Carregando...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.type === 'person' ? (
                <User className="h-3 w-3 text-blue-500 shrink-0" />
              ) : (
                <Users className="h-3 w-3 text-green-500 shrink-0" />
              )}
              <span className="truncate">{selectedOption.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {disabled ? "Disponível apenas para tarefas delegadas" : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoa..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[200px]">
          <div className="p-1">
            <button
              type="button"
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                !value && "bg-accent"
              )}
              onClick={() => {
                onValueChange(null as any);
                setOpen(false);
                setSearchTerm('');
              }}
            >
              <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
              Nenhuma pessoa
            </button>
            {filteredOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  type="button"
                  key={option.id}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === option.id && "bg-accent"
                  )}
                  onClick={() => {
                    onValueChange(option.id);
                    setOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.id ? "opacity-100" : "opacity-0")} />
                  <IconComponent className={`h-3 w-3 mr-2 ${option.type === 'person' ? 'text-blue-500' : 'text-green-500'}`} />
                  <span>{option.name}</span>
                  {option.role && <span className="text-xs text-muted-foreground ml-1">({option.role})</span>}
                </button>
              );
            })}
            {filteredOptions.length === 0 && searchTerm && (
              <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                Nenhum resultado para "{searchTerm}"
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
