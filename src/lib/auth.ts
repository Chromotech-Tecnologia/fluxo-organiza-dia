import { User } from '@/types';

const USERS_STORAGE_KEY = 'sistema_usuarios';
const CURRENT_USER_KEY = 'usuario_atual';

export const authService = {
  // Buscar todos os usuários
  getUsers(): User[] {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Salvar usuários
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  // Registrar novo usuário
  register(email: string, password: string, name: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const users = this.getUsers();
      
      // Verificar se email já existe
      if (users.find(u => u.email === email)) {
        reject(new Error('Email já cadastrado'));
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password, // Em produção, usar hash
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      this.saveUsers(users);
      resolve(newUser);
    });
  },

  // Login
  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const users = this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Email ou senha inválidos'));
      }
    });
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