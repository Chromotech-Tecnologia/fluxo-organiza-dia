import { useState, useMemo } from "react";
import { Person, TeamMember } from "@/types";
import { normalizeText } from "@/lib/searchUtils";

interface PeopleFilters {
  status?: string;
  skill?: string;
  project?: string;
}

export function usePeopleSearch(people: Person[], teamMembers: TeamMember[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PeopleFilters>({});

  const filteredPeople = useMemo(() => {
    let filtered = [...people];

    // Aplicar busca
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery);
      filtered = filtered.filter(person => 
        normalizeText(person.name).includes(normalizedQuery) ||
        normalizeText(person.role || "").includes(normalizedQuery) ||
        normalizeText(person.contact || "").includes(normalizedQuery)
      );
    }

    return filtered;
  }, [people, searchQuery]);

  const filteredTeamMembers = useMemo(() => {
    let filtered = [...teamMembers];

    // Aplicar busca
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery);
      filtered = filtered.filter(member => 
        normalizeText(member.name).includes(normalizedQuery) ||
        normalizeText(member.role || "").includes(normalizedQuery) ||
        normalizeText(member.email || "").includes(normalizedQuery) ||
        normalizeText(member.phone || "").includes(normalizedQuery) ||
        normalizeText(member.status || "").includes(normalizedQuery)
      );
    }

    // Aplicar filtros
    if (filters.status) {
      filtered = filtered.filter(member => member.status === filters.status);
    }

    if (filters.skill) {
      filtered = filtered.filter(member => 
        member.skillIds && Array.isArray(member.skillIds) && 
        member.skillIds.includes(filters.skill!)
      );
    }

    if (filters.project) {
      filtered = filtered.filter(member => 
        member.projects && Array.isArray(member.projects) && 
        member.projects.some(project => project.id === filters.project)
      );
    }

    return filtered;
  }, [teamMembers, searchQuery, filters]);

  const totalResults = filteredPeople.length + filteredTeamMembers.length;

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredPeople,
    filteredTeamMembers,
    totalResults
  };
}