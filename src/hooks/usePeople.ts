import { useState, useEffect } from 'react';
import { Person } from '@/types';
import { peopleStorage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pessoas do storage
  const loadPeople = () => {
    setLoading(true);
    try {
      const allPeople = peopleStorage.getAll();
      setPeople(allPeople);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pessoas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova pessoa
  const addPerson = (newPerson: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const person: Person = {
      ...newPerson,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    peopleStorage.add(person);
    loadPeople();
    
    toast({
      title: "Sucesso",
      description: "Pessoa adicionada com sucesso!"
    });
  };

  // Atualizar pessoa
  const updatePerson = (personId: string, updates: Partial<Person>) => {
    peopleStorage.update(personId, updates);
    loadPeople();
    
    toast({
      title: "Sucesso",
      description: "Pessoa atualizada com sucesso!"
    });
  };

  // Deletar pessoa
  const deletePerson = (personId: string) => {
    peopleStorage.delete(personId);
    loadPeople();
    
    toast({
      title: "Sucesso",
      description: "Pessoa removida com sucesso!"
    });
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