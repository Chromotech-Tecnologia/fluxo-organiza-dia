import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImpersonationState {
  isImpersonating: boolean;
  originalUserId: string | null;
  impersonatedUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  startImpersonation: (userId: string, userName: string | null, userEmail: string) => Promise<void>;
  stopImpersonation: () => void;
}

export const useImpersonation = create<ImpersonationState>()(
  persist(
    (set, get) => ({
      isImpersonating: false,
      originalUserId: null,
      impersonatedUser: null,
      
      startImpersonation: async (userId: string, userName: string | null, userEmail: string) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            toast.error('Você precisa estar logado para impersonar um usuário');
            return;
          }

          // Salvar o usuário original apenas se não estiver já impersonando
          const currentState = get();
          const originalUserId = currentState.isImpersonating 
            ? currentState.originalUserId 
            : session.user.id;

          set({
            isImpersonating: true,
            originalUserId: originalUserId,
            impersonatedUser: {
              id: userId,
              name: userName,
              email: userEmail
            }
          });

          toast.success(`Impersonando ${userName || userEmail}`, {
            description: 'Você está agora visualizando o sistema como este usuário'
          });
        } catch (error) {
          console.error('Erro ao iniciar impersonação:', error);
          toast.error('Erro ao impersonar usuário');
        }
      },

      stopImpersonation: () => {
        const currentState = get();
        if (currentState.impersonatedUser) {
          toast.success('Impersonação encerrada', {
            description: 'Você voltou à sua conta original'
          });
        }
        
        set({
          isImpersonating: false,
          originalUserId: null,
          impersonatedUser: null
        });
      }
    }),
    {
      name: 'impersonation-storage',
      partialize: (state) => ({
        isImpersonating: state.isImpersonating,
        originalUserId: state.originalUserId,
        impersonatedUser: state.impersonatedUser
      })
    }
  )
);