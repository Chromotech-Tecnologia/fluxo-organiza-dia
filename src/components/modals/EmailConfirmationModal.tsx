import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  isRegistration?: boolean;
}

export function EmailConfirmationModal({ 
  isOpen, 
  onClose, 
  email, 
  isRegistration = false 
}: EmailConfirmationModalProps) {
  const title = isRegistration 
    ? "Conta criada com sucesso!" 
    : "Email não confirmado";
  
  const description = isRegistration
    ? "Sua conta foi criada, mas você precisa confirmar seu email antes de fazer login."
    : "Você precisa confirmar seu email antes de acessar o sistema.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isRegistration ? (
              <CheckCircle className="w-8 h-8 text-primary" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p className="text-muted-foreground">
              {description}
            </p>
            {email && (
              <p className="text-sm font-medium">
                Email enviado para: <span className="text-primary">{email}</span>
              </p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 Verifique sua caixa de entrada</p>
              <p>📁 Não esqueça de verificar a pasta de spam</p>
              <p>🔗 Clique no link de confirmação no email</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Não recebeu o email? Verifique sua pasta de spam ou{" "}
              <button 
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  // This could trigger a resend email function in the future
                  console.log('Resend email requested');
                }}
              >
                solicite um novo
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}