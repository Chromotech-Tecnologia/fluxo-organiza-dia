
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const supabaseAuthService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    const redirectUrl = 'https://organizese.chromotech.com.br/';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          full_name: name
        }
      }
    });

    if (error) throw error;

    // Enviar email de confirmação de conta personalizado
    if (data.user && !error) {
      try {
        await supabase.functions.invoke('send-auth-emails', {
          body: {
            type: 'account-confirmation',
            email: email,
            data: {
              confirmLink: `https://organizese.chromotech.com.br/`,
              name: name
            }
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError);
        // Continue mesmo se o email personalizado falhar
      }
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user - fixed to properly handle async
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
