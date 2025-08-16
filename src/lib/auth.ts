import { User } from '@/types';
import { supabase } from './supabase';

const CURRENT_USER_KEY = 'usuario_atual';

export const authService = {
  // Migrar dados do localStorage para Supabase (para usuários existentes)
  async migrateLocalData(): Promise<void> {
    const localUsers = localStorage.getItem('sistema_usuarios');
    if (localUsers) {
      try {
        const users = JSON.parse(localUsers);
        for (const user of users) {
          // Verificar se usuário já existe no Supabase
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (!existingUser) {
            // Inserir usuário no Supabase
            await supabase.from('users').insert({
              id: user.id,
              email: user.email,
              password: user.password,
              name: user.name,
              created_at: user.createdAt,
              updated_at: user.updatedAt
            });
          }
        }
        
        // Limpar localStorage após migração
        localStorage.removeItem('sistema_usuarios');
      } catch (error) {
        console.error('Erro ao migrar dados:', error);
      }
    }
  },

  // Buscar todos os usuários
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return data?.map(user => ({
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  // Registrar novo usuário
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // Em produção, usar hash
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar usuário');
      }

      const user: User = {
        id: data.id,
        email: data.email,
        password: data.password,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Login
  async login(email: string, password: string): Promise<User> {
    try {
      // Primeiro, tentar migrar dados locais
      await this.migrateLocalData();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Email ou senha inválidos');
      }

      const user: User = {
        id: data.id,
        email: data.email,
        password: data.password,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Usuário atual
  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Verificar se está logado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
};