import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { Loader2, Mail } from 'lucide-react';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMemberId?: string;
  teamMemberName?: string;
}

export function InvitationModal({ isOpen, onClose, teamMemberId, teamMemberName }: InvitationModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendInvitation } = useTeamInvitations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    try {
      await sendInvitation(email.trim(), teamMemberId);
      setEmail('');
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
          <DialogTitle>Enviar Convite de Colaboração</DialogTitle>
          <DialogDescription>
            {teamMemberName 
              ? `Envie um convite para vincular ${teamMemberName} a um usuário da plataforma.`
              : 'Digite o email de um usuário cadastrado na plataforma para convidá-lo a colaborar.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              O usuário precisa estar cadastrado na plataforma para receber o convite.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}