import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useSupabasePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pessoas do Supabase
  const loadPeople = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
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
          active: true
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
    loadPeople();
  }, []);

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