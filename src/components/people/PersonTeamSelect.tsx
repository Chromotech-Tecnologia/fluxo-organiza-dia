
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { User, Users } from "lucide-react";

interface PersonTeamSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function PersonTeamSelect({ value, onValueChange, placeholder = "Selecionar pessoa ou equipe..." }: PersonTeamSelectProps) {
  // Usar filtros específicos para evitar re-renders desnecessários
  const { people, loading: loadingPeople } = useSupabasePeople();
  const { teamMembers, loading: loadingTeamMembers } = useSupabaseTeamMembers({
    status: 'ativo'
  });

  const isLoading = loadingPeople || loadingTeamMembers;

  // Debug apenas uma vez quando os dados mudam
  React.useEffect(() => {
    if (!isLoading) {
      console.log('PersonTeamSelect options:', {
        people: people.length,
        teamMembers: teamMembers.length,
        total: people.length + teamMembers.length,
        isLoading
      });
    }
  }, [people.length, teamMembers.length, isLoading]);

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
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {people.length > 0 && (
          <>
            <SelectItem disabled value="people-header" className="font-semibold text-xs">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                PESSOAS
              </div>
            </SelectItem>
            {people.map((person) => (
              <SelectItem key={`person-${person.id}`} value={person.id}>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-blue-500" />
                  <span>{person.name}</span>
                  {person.role && <span className="text-xs text-muted-foreground">({person.role})</span>}
                </div>
              </SelectItem>
            ))}
          </>
        )}
        
        {teamMembers.length > 0 && (
          <>
            {people.length > 0 && <SelectItem disabled value="separator-line" className="border-t">---</SelectItem>}
            <SelectItem disabled value="team-header" className="font-semibold text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                EQUIPE
              </div>
            </SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={`team-${member.id}`} value={member.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-green-500" />
                  <span>{member.name}</span>
                  {member.role && <span className="text-xs text-muted-foreground">({member.role})</span>}
                </div>
              </SelectItem>
            ))}
          </>
        )}
        
        {people.length === 0 && teamMembers.length === 0 && (
          <SelectItem disabled value="empty-state">
            Nenhuma pessoa ou membro da equipe ativo encontrado
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
