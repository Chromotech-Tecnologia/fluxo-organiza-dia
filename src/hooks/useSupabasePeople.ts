
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';

export function useSupabasePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Carregar apenas pessoas ativas do Supabase
  const loadPeople = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true) // Filtrar apenas pessoas ativas
        .order('name');

      if (error) throw error;

      // Converter dados do Supabase para o tipo Person
      const convertedPeople: Person[] = (data || []).map(person => ({
        id: person.id,
        name: person.name,
        role: person.role || '',
        contact: person.phone || person.email || '',
        isPartner: false, // default
        createdAt: person.created_at,
        updatedAt: person.updated_at
      }));

      setPeople(convertedPeople);
    } catch (error: any) {
      console.error('Error loading people:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pessoas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova pessoa
  const addPerson = async (newPerson: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('people')
        .insert([{
          name: newPerson.name,
          role: newPerson.role,
          phone: newPerson.contact,
          email: '',
          department: '',
          notes: '',
          active: true,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadPeople();
      
      toast({
        title: "Sucesso",
        description: "Pessoa adicionada com sucesso!"
      });
    } catch (error: any) {
      console.error('Error adding person:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar pessoa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar pessoa
  const updatePerson = async (personId: string, updates: Partial<Person>) => {
    try {
      const { error } = await supabase
        .from('people')
        .update({
          name: updates.name,
          role: updates.role,
          phone: updates.contact,
          email: '',
          department: '',
          notes: '',
          active: true
        })
        .eq('id', personId);

      if (error) throw error;

      await loadPeople();
      
      toast({
        title: "Sucesso",
        description: "Pessoa atualizada com sucesso!"
      });
    } catch (error: any) {
      console.error('Error updating person:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar pessoa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar pessoa
  const deletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      await loadPeople();
      
      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso!"
      });
    } catch (error: any) {
      console.error('Error deleting person:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover pessoa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Obter pessoa por ID
  const getPersonById = (personId: string): Person | undefined => {
    return people.find(p => p.id === personId);
  };

  // Filtrar pessoas
  const filterPeople = (query: string): Person[] => {
    if (!query.trim()) return people;
    
    const lowercaseQuery = query.toLowerCase();
    return people.filter(person => 
      person.name.toLowerCase().includes(lowercaseQuery) ||
      person.role.toLowerCase().includes(lowercaseQuery) ||
      person.contact.toLowerCase().includes(lowercaseQuery)
    );
  };

  useEffect(() => {
    if (user) {
      loadPeople();
      
      // Setup real-time subscription
      const channel = supabase
        .channel('people-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'people',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            loadPeople();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    people,
    loading,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonById,
    filterPeople,
    refetch: loadPeople
  };
}
