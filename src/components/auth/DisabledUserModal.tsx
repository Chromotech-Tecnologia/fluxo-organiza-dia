import { AlertCircle, LogOut, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabaseAuthService } from '@/lib/supabaseAuth';

interface DisabledUserModalProps {
  open: boolean;
  userName?: string;
}

export function DisabledUserModal({ open, userName }: DisabledUserModalProps) {
  const handleSignOut = async () => {
    await supabaseAuthService.signOut();
    window.location.reload();
  };

  const handleContactSupport = () => {
    const whatsappUrl = `https://wa.me/5511969169869?text=Olá, minha conta foi desabilitada no sistema OrganizeSe e preciso de ajuda para reativar.`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Conta Desabilitada
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Olá, {userName || 'usuário'}
            </p>
            <p className="font-medium">
              Sua conta foi desabilitada pelo administrador do sistema.
            </p>
            <p className="text-sm text-muted-foreground">
              Para reativar sua conta, entre em contato com o administrador do sistema.
            </p>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Não é possível acessar o sistema até que sua conta seja reativada.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <Button
                onClick={handleContactSupport}
                variant="default"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Falar com Suporte
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Sistema
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}