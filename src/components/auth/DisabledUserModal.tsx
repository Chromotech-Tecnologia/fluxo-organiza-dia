import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DisabledUserModalProps {
  open: boolean;
  userName?: string;
}

export function DisabledUserModal({ open, userName }: DisabledUserModalProps) {
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}