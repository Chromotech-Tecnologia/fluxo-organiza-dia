import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, X, Check, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { supabase } from '@/integrations/supabase/client';

export function PendingInvitationBanner() {
  const { invitations, loading, acceptInvitation, rejectInvitation } = useTeamInvitations();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  // Carregar nomes dos remetentes
  useEffect(() => {
    const fetchSenderNames = async () => {
      const pendingInvites = invitations.filter(
        inv => inv.status === 'pending' && 
        inv.recipient_user_id === currentUserId &&
        new Date(inv.expires_at) > new Date()
      );

      if (pendingInvites.length === 0) return;

      const senderIds = [...new Set(pendingInvites.map(inv => inv.sender_user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', senderIds);

      if (profiles) {
        const names: Record<string, string> = {};
        profiles.forEach(profile => {
          // Usar o email se o nome não estiver disponível
          names[profile.id] = profile.name || profile.email || 'Usuário';
        });
        setSenderNames(names);
      }
    };

    if (currentUserId) {
      fetchSenderNames();
    }
  }, [invitations, currentUserId]);

  if (loading || !currentUserId) return null;

  const pendingInvites = invitations.filter(
    inv => inv.status === 'pending' && 
    inv.recipient_user_id === currentUserId &&
    new Date(inv.expires_at) > new Date()
  );

  if (pendingInvites.length === 0) return null;

  const handleAccept = async (invitationToken: string) => {
    setProcessingInvites(prev => new Set(prev).add(invitationToken));
    try {
      await acceptInvitation(invitationToken);
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationToken);
        return newSet;
      });
    }
  };

  const handleReject = async (invitationToken: string) => {
    setProcessingInvites(prev => new Set(prev).add(invitationToken));
    try {
      await rejectInvitation(invitationToken);
    } finally {
      setProcessingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationToken);
        return newSet;
      });
    }
  };

  return (
    <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 animate-in slide-in-from-top duration-300">
      <Alert className="border-0 border-l-4 border-l-blue-500 rounded-none bg-transparent shadow-none">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-500 p-2 rounded-full">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertDescription className="text-base font-medium text-foreground">
                Você tem {pendingInvites.length} convite{pendingInvites.length !== 1 ? 's' : ''} pendente{pendingInvites.length !== 1 ? 's' : ''} de colaboração
              </AlertDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {pendingInvites.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Ver Convites
                </>
              )}
            </Button>
          </div>
        </div>
      </Alert>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top duration-200">
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      Convite de {senderNames[invite.sender_user_id] || 'Usuário'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recebido em {new Date(invite.invited_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invite.invitation_token)}
                    disabled={processingInvites.has(invite.invitation_token)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(invite.invitation_token)}
                    disabled={processingInvites.has(invite.invitation_token)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
