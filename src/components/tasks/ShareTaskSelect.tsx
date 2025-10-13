import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskShares, SharedUser } from '@/hooks/useTaskShares';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ShareTaskSelectProps {
  taskId: string;
  disabled?: boolean;
}

export function ShareTaskSelect({ taskId, disabled }: ShareTaskSelectProps) {
  const { getSharedUsers, shareTask, unshareTask, getTaskShares } = useTaskShares();
  const [availableUsers, setAvailableUsers] = useState<SharedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const taskShares = getTaskShares(taskId);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const users = await getSharedUsers();
      setAvailableUsers(users);
      setLoading(false);
    };
    loadUsers();
  }, [getSharedUsers]);

  const handleShare = async () => {
    if (!selectedUserId) return;
    
    try {
      await shareTask(taskId, selectedUserId);
      setSelectedUserId('');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleUnshare = async (sharedWithUserId: string) => {
    try {
      await unshareTask(taskId, sharedWithUserId);
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
    }
  };

  const getSharedUserName = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user?.name || user?.email || 'Usuário';
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
    user => !taskShares.some(share => share.shared_with_user_id === user.id)
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
          onClick={handleShare}
          disabled={!selectedUserId || disabled}
          size="sm"
        >
          Compartilhar
        </Button>
      </div>

      {taskShares.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Compartilhado com:</p>
          <div className="flex flex-wrap gap-2">
            {taskShares.map(share => (
              <Badge key={share.id} variant="secondary" className="gap-1">
                {getSharedUserName(share.shared_with_user_id)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleUnshare(share.shared_with_user_id)}
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
