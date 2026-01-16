import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { useImpersonation } from '@/hooks/useImpersonation';

export function useSupabaseSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const currentUserId = useCurrentUserId(); // Usar ID considerando impersonação
  const { isImpersonating } = useImpersonation();

  // Carregar skills do Supabase
  const loadSkills = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      let data: any[] = [];
      let error: any = null;
      
      // Se está impersonando, usar a função RPC SECURITY DEFINER
      if (isImpersonating) {
        const result = await supabase.rpc('get_skills_for_user', {
          target_user_id: currentUserId
        });
        data = result.data || [];
        error = result.error;
      } else {
        // Buscar normalmente via RLS
        const result = await supabase
          .from('skills')
          .select('*')
          .eq('user_id', currentUserId)
          .order('name');
        data = result.data || [];
        error = result.error;
      }

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
      console.error('Error loading skills:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar habilidades: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isImpersonating]);

  // Adicionar nova skill
  const addSkill = async (newSkill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: newSkill.name,
          category: newSkill.area,
          description: newSkill.observation,
          user_id: user.id
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
      console.error('Error adding skill:', error);
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
      console.error('Error updating skill:', error);
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
      console.error('Error deleting skill:', error);
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
    if (currentUserId) {
      loadSkills();
      
      // Setup real-time subscription usando currentUserId para impersonação
      const channel = supabase
        .channel('skills-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'skills',
            filter: `user_id=eq.${currentUserId}`
          },
          () => {
            loadSkills();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId, loadSkills]);

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
