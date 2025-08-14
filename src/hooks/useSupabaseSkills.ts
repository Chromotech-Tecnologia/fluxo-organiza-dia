import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useSupabaseSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar skills do Supabase
  const loadSkills = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;

      // Converter dados do Supabase para o tipo Skill
      const convertedSkills: Skill[] = (data || []).map(skill => ({
        id: skill.id,
        name: skill.name,
        area: skill.category || '',
        observation: skill.description || '',
        
        createdAt: skill.created_at,
        updatedAt: skill.updated_at
      }));

      setSkills(convertedSkills);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar habilidades: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova skill
  const addSkill = async (newSkill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: newSkill.name,
          category: newSkill.area,
          description: newSkill.observation,
          
        }])
        .select()
        .single();

      if (error) throw error;

      await loadSkills();
      
      toast({
        title: "Sucesso",
        description: "Habilidade adicionada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar habilidade: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar skill
  const updateSkill = async (skillId: string, updates: Partial<Skill>) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({
          name: updates.name,
          category: updates.area,
          description: updates.observation,
          
        })
        .eq('id', skillId);

      if (error) throw error;

      await loadSkills();
      
      toast({
        title: "Sucesso",
        description: "Habilidade atualizada com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar habilidade: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar skill
  const deleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      await loadSkills();
      
      toast({
        title: "Sucesso",
        description: "Habilidade removida com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao remover habilidade: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
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
    
    // Setup real-time subscription
    const channel = supabase
      .channel('skills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skills'
        },
        () => {
          console.log('Skills changed, reloading...');
          loadSkills();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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