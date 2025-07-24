import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useSkills } from '@/hooks/useSkills';
import { useModalStore } from '@/stores/useModalStore';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberFilter } from '@/types';

export default function PeoplePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativo' | 'inativo' | ''>('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const filters: TeamMemberFilter = {
    search: search || undefined,
    status: statusFilter || undefined,
    skillIds: skillFilter.length > 0 ? skillFilter : undefined,
  };

  const { teamMembers, loading } = useTeamMembers(filters);
  const { skills } = useSkills();
  const { openTeamMemberModal } = useModalStore();

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSkillFilter([]);
  };

  const toggleSkillFilter = (skillId: string) => {
    setSkillFilter(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe
          </p>
        </div>
        <Button onClick={() => openTeamMemberModal()}>
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
                {teamMembers.length} membro{teamMembers.length !== 1 ? 's' : ''} encontrado{teamMembers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
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
              onChange={(e) => setSearch(e.target.value)}
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
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Habilidades</label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                    {skills.map((skill) => (
                      <label key={skill.id} className="flex items-center space-x-2 text-sm">
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
                {search || statusFilter || skillFilter.length > 0
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