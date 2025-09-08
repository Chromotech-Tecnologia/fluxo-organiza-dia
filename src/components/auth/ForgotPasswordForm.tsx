import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const redirectUrl = 'https://organizese.chromotech.com.br/reset-password';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // Enviar email personalizado através da edge function
      try {
        const resetLink = `${redirectUrl}?email=${encodeURIComponent(email)}`;
        
        await supabase.functions.invoke('send-auth-emails', {
          body: {
            type: 'forgot-password',
            email: email,
            data: {
              resetLink: resetLink
            }
          }
        });
      } catch (emailError) {
        console.error('Erro ao enviar email personalizado:', emailError);
        // Continue mesmo se o email personalizado falhar
      }

      setEmailSent(true);
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      setError(error.message || 'Erro ao enviar email de recuperação');
      toast.error('Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos as instruções de recuperação para {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Verifique sua caixa de entrada e clique no link para redefinir sua senha. 
              O link expira em 1 hora.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground text-center">
            Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Esqueceu a Senha?</CardTitle>
        <CardDescription>
          Digite seu email para receber instruções de recuperação
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};