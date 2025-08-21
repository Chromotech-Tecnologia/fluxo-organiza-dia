
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, ChevronDown, Search, User, Users, Briefcase } from "lucide-react";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { cn } from "@/lib/utils";

interface PersonTeamSelectProps {
  selectedPersonId?: string;
  onPersonSelect: (personId: string) => void;
}

export function PersonTeamSelect({ selectedPersonId, onPersonSelect }: PersonTeamSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { people } = useSupabasePeople();
  const { teamMembers } = useSupabaseTeamMembers();

  // Combinar pessoas e membros da equipe
  const allPersons = [
    ...people.map(person => ({
      id: person.id,
      name: person.name,
      role: person.role || 'Pessoa',
      type: 'person' as const,
      isPartner: person.isPartner || false
    })),
    ...teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role || 'Membro da Equipe',
      type: 'team' as const,
      isPartner: member.isPartner || false
    }))
  ];

  // Filtrar por busca
  const filteredPersons = allPersons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.role.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPerson = allPersons.find(p => p.id === selectedPersonId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeIcon = (type: 'person' | 'team') => {
    return type === 'person' ? User : Users;
  };

  const getTypeColor = (type: 'person' | 'team') => {
    return type === 'person' ? 'text-blue-600' : 'text-green-600';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPerson ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(selectedPerson.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedPerson.name}</span>
                <span className="text-xs text-muted-foreground">{selectedPerson.role}</span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecionar pessoa ou membro...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoa ou membro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {filteredPersons.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma pessoa encontrada</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPersons.map((person) => {
                  const TypeIcon = getTypeIcon(person.type);
                  const isSelected = selectedPersonId === person.id;
                  
                  return (
                    <div
                      key={person.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        onPersonSelect(person.id);
                        setOpen(false);
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{person.name}</p>
                          {person.isPartner && (
                            <Badge variant="secondary" className="text-xs">
                              Parceiro
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <TypeIcon className={cn("h-3 w-3", getTypeColor(person.type))} />
                          <span className="truncate">{person.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            person.type === 'person' ? 'border-blue-300 text-blue-600' : 'border-green-300 text-green-600'
                          )}
                        >
                          {person.type === 'person' ? 'Pessoa' : 'Equipe'}
                        </Badge>
                        
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer com resumo */}
        <div className="border-t p-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>{people.length} pessoas</span>
            <span>{teamMembers.length} membros da equipe</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
