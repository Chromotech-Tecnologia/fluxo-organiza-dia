
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter } from 'lucide-react';
import { useSupabaseTeamMembers } from '@/hooks/useSupabaseTeamMembers';
import { useSupabaseSkills } from '@/hooks/useSupabaseSkills';
import { useModalStore } from '@/stores/useModalStore';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberFilter } from '@/types';

export default function PeoplePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativo' | 'inativo' | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Memoizar os filtros para evitar recriação desnecessária
  const filters: TeamMemberFilter = useMemo(() => ({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    skillIds: skillFilter.length > 0 ? skillFilter : undefined,
  }), [search, statusFilter, skillFilter]);

  const { teamMembers, loading } = useSupabaseTeamMembers(filters);
  const { skills } = useSupabaseSkills();
  const { openTeamMemberModal } = useModalStore();

  // Usar useCallback para evitar re-renderizações desnecessárias
  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setSkillFilter([]);
  }, []);

  const toggleSkillFilter = useCallback((skillId: string) => {
    setSkillFilter(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  }, []);

  const handleNewMember = useCallback(() => {
    try {
      openTeamMemberModal();
    } catch (error) {
      console.error('Erro ao abrir modal:', error);
    }
  }, [openTeamMemberModal]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleStatusChange = useCallback((value: 'ativo' | 'inativo' | 'all') => {
    setStatusFilter(value);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe
          </p>
        </div>
        <Button onClick={handleNewMember}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                {loading ? (
                  'Carregando...'
                ) : (
                  `${teamMembers.length} membro${teamMembers.length !== 1 ? 's' : ''} encontrado${teamMembers.length !== 1 ? 's' : ''}`
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={toggleFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo, email ou origem..."
              value={search}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>

          {showFilters && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Habilidades</label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1 bg-background">
                    {skills.map((skill) => (
                      <label key={skill.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skillFilter.includes(skill.id)}
                          onChange={() => toggleSkillFilter(skill.id)}
                          className="rounded"
                        />
                        <span>{skill.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando membros da equipe...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' || skillFilter.length > 0
                  ? 'Nenhum membro encontrado com os filtros aplicados.'
                  : 'Nenhum membro da equipe cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((teamMember) => (
                <TeamMemberCard
                  key={teamMember.id}
                  teamMember={teamMember}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
