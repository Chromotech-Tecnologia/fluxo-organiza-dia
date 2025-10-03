import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { Loader2, Mail, User } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userName: string;
  teamMemberId?: string;
  teamMemberName?: string;
}

export function InvitationModal({ isOpen, onClose, email, userName, teamMemberId, teamMemberName }: InvitationModalProps) {
  const [loading, setLoading] = useState(false);
  const { sendInvitation } = useTeamInvitations();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await sendInvitation(email, teamMemberId);
      onClose();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Envio de Convite</DialogTitle>
          <DialogDescription>
            {teamMemberName 
              ? `Confirmar envio de convite para vincular ${teamMemberName} ao usuário da plataforma?`
              : 'Confirmar envio de convite de colaboração?'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Usuário:</span>
              <span className="text-muted-foreground">{userName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span className="text-muted-foreground">{email}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            O usuário receberá um email com o link para aceitar o convite de colaboração.
          </p>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Envio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}