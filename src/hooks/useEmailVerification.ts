import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VerifyEmailResponse {
  exists: boolean;
  userName?: string;
  userId?: string;
  error?: string;
  message?: string;
}

export function useEmailVerification() {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmail = async (email: string): Promise<{ 
    isValid: boolean; 
    userName?: string;
    userId?: string;
  }> => {
    if (!email || !email.trim()) {
      toast({
        title: "Email inválido",
        description: "Este membro não possui email cadastrado",
        variant: "destructive"
      });
      return { isValid: false };
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke<VerifyEmailResponse>(
        'verify-user-email',
        {
          body: { email: email.trim() }
        }
      );

      if (error) {
        console.error('Error verifying email:', error);
        toast({
          title: "Erro ao verificar email",
          description: "Não foi possível verificar se o email está cadastrado",
          variant: "destructive"
        });
        return { isValid: false };
      }

      if (!data?.exists) {
        toast({
          title: "Email não cadastrado",
          description: data?.message || "Este email não está cadastrado na plataforma. Solicite o email correto para fazer o convite.",
          variant: "destructive"
        });
        return { isValid: false };
      }

      return { 
        isValid: true, 
        userName: data.userName,
        userId: data.userId
      };

    } catch (error: any) {
      console.error('Error in verifyEmail:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar email do usuário",
        variant: "destructive"
      });
      return { isValid: false };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyEmail,
    isVerifying
  };
}
