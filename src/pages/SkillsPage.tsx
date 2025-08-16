import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { useSupabaseSkills } from '@/hooks/useSupabaseSkills';
import { useModalStore } from '@/stores/useModalStore';
import { SkillCard } from '@/components/skills/SkillCard';
import { SkillModal } from '@/components/modals/SkillModal';

export function SkillsPage() {
  const [search, setSearch] = useState('');
  const { skills, loading } = useSupabaseSkills();
  const { openSkillModal } = useModalStore();

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase()) ||
    skill.area.toLowerCase().includes(search.toLowerCase()) ||
    skill.observation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">
            Gerencie as habilidades da sua equipe
          </p>
        </div>
        <Button onClick={() => openSkillModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Habilidade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades Cadastradas</CardTitle>
          <CardDescription>
            Total de {skills.length} habilidade{skills.length !== 1 ? 's' : ''} cadastrada{skills.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar habilidades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando habilidades...</p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {search ? 'Nenhuma habilidade encontrada para a busca.' : 'Nenhuma habilidade cadastrada ainda.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SkillModal />
    </div>
  );
}