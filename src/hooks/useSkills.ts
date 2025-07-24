import { useState, useEffect } from 'react';
import { Skill } from '@/types';
import { skillsStorage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar skills do storage
  const loadSkills = () => {
    setLoading(true);
    try {
      const allSkills = skillsStorage.getAll();
      setSkills(allSkills);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar habilidades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova skill
  const addSkill = (newSkill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const skill: Skill = {
      ...newSkill,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    skillsStorage.add(skill);
    loadSkills();
    
    toast({
      title: "Sucesso",
      description: "Habilidade adicionada com sucesso!"
    });
  };

  // Atualizar skill
  const updateSkill = (skillId: string, updates: Partial<Skill>) => {
    skillsStorage.update(skillId, updates);
    loadSkills();
    
    toast({
      title: "Sucesso",
      description: "Habilidade atualizada com sucesso!"
    });
  };

  // Deletar skill
  const deleteSkill = (skillId: string) => {
    skillsStorage.delete(skillId);
    loadSkills();
    
    toast({
      title: "Sucesso",
      description: "Habilidade removida com sucesso!"
    });
  };

  // Obter skill por ID
  const getSkillById = (skillId: string): Skill | undefined => {
    return skills.find(s => s.id === skillId);
  };

  // Filtrar skills
  const filterSkills = (query: string): Skill[] => {
    if (!query.trim()) return skills;
    
    const lowercaseQuery = query.toLowerCase();
    return skills.filter(skill => 
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      skill.area.toLowerCase().includes(lowercaseQuery) ||
      skill.observation.toLowerCase().includes(lowercaseQuery)
    );
  };

  useEffect(() => {
    loadSkills();
  }, []);

  return {
    skills,
    loading,
    addSkill,
    updateSkill,
    deleteSkill,
    getSkillById,
    filterSkills,
    refetch: loadSkills
  };
}