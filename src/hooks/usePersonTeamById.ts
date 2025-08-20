
import { useSupabasePeople } from "@/hooks/useSupabasePeople";
import { useSupabaseTeamMembers } from "@/hooks/useSupabaseTeamMembers";
import { useMemo } from "react";

export function usePersonTeamById(id?: string) {
  const { people } = useSupabasePeople();
  const { teamMembers } = useSupabaseTeamMembers({
    status: 'ativo'
  });

  const personTeam = useMemo(() => {
    if (!id) return null;

    // Procurar primeiro em pessoas
    const person = people.find(p => p.id === id);
    if (person) {
      return {
        id: person.id,
        name: person.name,
        role: person.role,
        type: 'person' as const
      };
    }

    // Procurar em membros da equipe
    const teamMember = teamMembers.find(tm => tm.id === id);
    if (teamMember) {
      return {
        id: teamMember.id,
        name: teamMember.name,
        role: teamMember.role,
        type: 'teamMember' as const
      };
    }

    return null;
  }, [id, people, teamMembers]);

  return personTeam;
}
