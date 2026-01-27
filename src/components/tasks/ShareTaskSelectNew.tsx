import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';

interface SharedUser {
  id: string;
  email: string;
  name: string;
}

interface PendingShare {
  userId: string;
  userName: string;
}

interface ShareTaskSelectNewProps {
  taskId?: string; // Optional - when creating a new task, this won't exist yet
  pendingShares?: PendingShare[];
  onPendingSharesChange?: (shares: PendingShare[]) => void;
  disabled?: boolean;
}

export function ShareTaskSelectNew({ 
  taskId, 
  pendingShares = [], 
  onPendingSharesChange,
  disabled 
}: ShareTaskSelectNewProps) {
  const currentUserId = useCurrentUserId();
  const [availableUsers, setAvailableUsers] = useState<SharedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      // Buscar usuários que aceitaram convites (colaboradores)
      const { data: collaborations, error: collabError } = await supabase
        .from('team_collaborations')
        .select('collaborator_user_id')
        .eq('owner_user_id', currentUserId)
        .eq('is_active', true);

      if (collabError) throw collabError;

      if (!collaborations || collaborations.length === 0) {
        setAvailableUsers([]);
        setLoading(false);
        return;
      }

      const userIds = collaborations.map(c => c.collaborator_user_id);

      // Buscar perfis dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      setAvailableUsers((profiles || []).map(p => ({
        id: p.id,
        email: p.email || '',
        name: p.name || p.email || 'Usuário'
      })));
    } catch (error) {
      console.error('Erro ao buscar usuários compartilháveis:', error);
      setAvailableUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddPendingShare = () => {
    if (!selectedUserId || !onPendingSharesChange) return;
    
    const user = availableUsers.find(u => u.id === selectedUserId);
    if (!user) return;

    const alreadyPending = pendingShares.some(p => p.userId === selectedUserId);
    if (alreadyPending) return;

    onPendingSharesChange([
      ...pendingShares,
      { userId: user.id, userName: user.name || user.email }
    ]);
    setSelectedUserId('');
  };

  const handleRemovePendingShare = (userId: string) => {
    if (!onPendingSharesChange) return;
    onPendingSharesChange(pendingShares.filter(p => p.userId !== userId));
  };

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (availableUsers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhum colaborador disponível para compartilhar
      </div>
    );
  }

  const unsharedUsers = availableUsers.filter(
    user => !pendingShares.some(p => p.userId === user.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={selectedUserId}
          onValueChange={setSelectedUserId}
          disabled={disabled || unsharedUsers.length === 0}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {unsharedUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleAddPendingShare}
          disabled={!selectedUserId || disabled}
          size="sm"
        >
          Adicionar
        </Button>
      </div>

      {pendingShares.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Será compartilhado com:</p>
          <div className="flex flex-wrap gap-2">
            {pendingShares.map(share => (
              <Badge key={share.userId} variant="secondary" className="gap-1">
                {share.userName}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemovePendingShare(share.userId)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
