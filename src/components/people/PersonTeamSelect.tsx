
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

interface PersonTeamSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function PersonTeamSelect({ 
  value, 
  onChange, 
  placeholder = "Selecione uma pessoa ou membro da equipe", 
  className 
}: PersonTeamSelectProps) {
  const { people, loading: loadingPeople } = useSupabasePeople();
  const { teamMembers, loading: loadingTeamMembers } = useSupabaseTeamMembers({
    status: 'ativo' // Filtrar apenas membros ativos
  });

  const isLoading = loadingPeople || loadingTeamMembers;

  // Combinar pessoas e membros da equipe em uma única lista
  const allOptions = [
    ...people.map(person => ({
      id: person.id,
      name: person.name,
      role: person.role,
      type: 'person' as const
    })),
    ...teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      type: 'teamMember' as const
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  console.log('PersonTeamSelect options:', {
    people: people.length,
    teamMembers: teamMembers.length,
    total: allOptions.length,
    isLoading
  });

  return (
    <Select 
      value={value || "all"} 
      onValueChange={(newValue) => onChange(newValue === "all" ? undefined : newValue)}
      disabled={isLoading}
    >
      <SelectTrigger className={cn("h-10 text-sm", className)}>
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        <SelectItem value="all">{placeholder}</SelectItem>
        
        {/* Seção de Pessoas */}
        {people.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-1">
              <User className="h-3 w-3" />
              Pessoas
            </div>
            {people.map((person) => (
              <SelectItem key={`person-${person.id}`} value={person.id}>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{person.name}</div>
                    {person.role && (
                      <div className="text-xs text-muted-foreground">{person.role}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {/* Seção de Membros da Equipe */}
        {teamMembers.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Equipe
            </div>
            {teamMembers.map((member) => (
              <SelectItem key={`team-${member.id}`} value={member.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{member.name}</div>
                    {member.role && (
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {/* Estado vazio */}
        {!isLoading && allOptions.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nenhuma pessoa ou membro da equipe ativo encontrado.
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
