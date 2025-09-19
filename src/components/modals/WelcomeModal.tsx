import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageCircle, Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/integrations/supabase/client';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      // Verificar se é o primeiro login
      checkFirstLogin();
    }
  }, [user]);

  const checkFirstLogin = async () => {
    if (!user) return;

    try {
      // Verificar se já mostrou a mensagem de boas vindas
      const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_shown')
        .eq('id', user.id)
        .single();

      if (profile && !profile.welcome_shown) {
        setIsOpen(true);
        
        // Marcar como mostrado
        await supabase
          .from('profiles')
          .update({ welcome_shown: true })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar primeiro login:', error);
    }
  };

  const handleContactSupport = () => {
    const message = encodeURIComponent(
      'Olá! Acabei de me cadastrar no sistema Organize-se e gostaria de saber mais sobre os planos disponíveis.'
    );
    window.open(`https://wa.me/5511969169869?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Bem-vindo ao Organize-se!</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                Conta criada com sucesso!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Sua jornada de organização e produtividade começa agora.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Clock className="h-5 w-5" />
                Período de Teste Gratuito
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Você ganhou <strong>7 dias grátis</strong> para explorar todas as funcionalidades do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300">
              <ul className="space-y-2 text-sm">
                <li>• Criar e organizar tarefas</li>
                <li>• Gerenciar equipe e pessoas</li>
                <li>• Visualizar relatórios e estatísticas</li>
                <li>• Acompanhar progresso em calendário</li>
                <li>• E muito mais!</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Precisa de Ajuda?
              </CardTitle>
              <CardDescription>
                Nossa equipe de suporte está pronta para ajudar você a aproveitar ao máximo o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={handleContactSupport}
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar com Suporte via WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Começar a usar o sistema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}