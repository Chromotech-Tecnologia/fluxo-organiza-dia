import { useState, useEffect } from 'react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useTrialManagement, TrialStatus } from '@/hooks/useTrialManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ShieldCheck, ShieldX, UserPlus, Users, Key, Eye, Clock, CheckCircle, Mail, MailCheck, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function UserManagement() {
  const { allUsers, loading, addRoleToUser, removeRoleFromUser, toggleUserStatus, loadAllUsers, confirmUserEmail, createMissingProfile } = useUserRoles();
  const { startImpersonation } = useImpersonation();
  const { getTrialStatus, setTrialPeriod, activatePermanent, disableUser, loading: trialLoading } = useTrialManagement();
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialDays, setTrialDays] = useState('');
  const [userTrialStatus, setUserTrialStatus] = useState<Record<string, TrialStatus>>({});

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const hasRole = (userRoles: AppRole[], role: AppRole) => {
    return userRoles.includes(role);
  };

  const isUserDisabled = (userRoles: AppRole[]) => {
    return userRoles.length === 0;
  };

  const getUserStatus = (userRoles: AppRole[], userId: string) => {
    const trial = userTrialStatus[userId];
    if (userRoles.length === 0) return 'disabled';
    if (trial?.isPermanent) return 'permanent';
    if (trial?.isInTrial) return 'trial';
    return 'active';
  };

  const getUserStatusBadge = (userRoles: AppRole[], userId: string) => {
    const status = getUserStatus(userRoles, userId);
    const trial = userTrialStatus[userId];
    
    switch (status) {
      case 'disabled':
        return (
          <Badge variant="destructive">
            <ShieldX className="w-3 h-3 mr-1" />
            Desabilitado
          </Badge>
        );
      case 'permanent':
        return (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Permanente
          </Badge>
        );
      case 'trial':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Teste ({trial?.daysRemaining} dias)
          </Badge>
        );
      default:
        return (
          <Badge variant="default">
            <Shield className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUserId || !newPassword) return;
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/admin-update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao alterar senha');
      }

      toast.success('Senha alterada com sucesso');
      setPasswordChangeOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId(null);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName) return;

    if (newUserPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsCreatingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('https://sfwxbotcnfpjkwrsfyqj.supabase.co/functions/v1/admin-create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
          role: newUserRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      toast.success('Usuário criado com sucesso');
      setCreateUserOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('user');
      loadAllUsers(); // Recarregar lista de usuários
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openCreateUser = () => {
    setCreateUserOpen(true);
  };

  const openPasswordChange = (userId: string) => {
    setSelectedUserId(userId);
    setPasswordChangeOpen(true);
  };

  const openTrialModal = (userId: string) => {
    setSelectedUserId(userId);
    setTrialModalOpen(true);
  };

  const handleSetTrial = async () => {
    if (!selectedUserId || !trialDays) return;
    
    const days = parseInt(trialDays);
    if (days <= 0) {
      toast.error('Número de dias deve ser maior que zero');
      return;
    }

    await setTrialPeriod(selectedUserId, days);
    setTrialModalOpen(false);
    setTrialDays('');
    setSelectedUserId(null);
    loadTrialStatuses();
    loadAllUsers();
  };

  const handleActivatePermanent = async (userId: string) => {
    await activatePermanent(userId);
    loadTrialStatuses();
    loadAllUsers();
  };

  const handleDisableUser = async (userId: string) => {
    await disableUser(userId);
    loadTrialStatuses();
    loadAllUsers();
  };

  const loadTrialStatuses = async () => {
    const statuses: Record<string, TrialStatus> = {};
    for (const user of allUsers) {
      try {
        statuses[user.id] = await getTrialStatus(user.id);
      } catch (error) {
        console.error(`Error loading trial status for user ${user.id}:`, error);
      }
    }
    setUserTrialStatus(statuses);
  };

  useEffect(() => {
    if (allUsers.length > 0) {
      loadTrialStatuses();
    }
  }, [allUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários e suas permissões</p>
        </div>
        <Button onClick={openCreateUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter(user => hasRole(user.roles, 'admin')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter(user => !isUserDisabled(user.roles)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.name || 'Sem nome'}
                        {!user.has_profile && (
                          <Badge variant="outline" className="text-xs">
                            <UserX className="w-3 h-3 mr-1" />
                            Sem perfil
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email_confirmed ? (
                          <Badge variant="default" className="gap-1">
                            <MailCheck className="w-3 h-3" />
                            Confirmado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Mail className="w-3 h-3" />
                            Pendente
                          </Badge>
                        )}
                        {user.email_confirmed_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.email_confirmed_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <Badge variant="outline">Desabilitado</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUserStatusBadge(user.roles, user.id)}
                    </TableCell>
                    <TableCell>
                      {user.created_at && formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Select
                          value={selectedRole}
                          onValueChange={(value) => setSelectedRole(value as AppRole)}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addRoleToUser(user.id, selectedRole)}
                          disabled={hasRole(user.roles, selectedRole)}
                          className="h-8 px-2"
                        >
                          +
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeRoleFromUser(user.id, selectedRole)}
                          disabled={!hasRole(user.roles, selectedRole)}
                          className="h-8 px-2"
                        >
                          -
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openPasswordChange(user.id)}
                          className="h-8 px-2"
                        >
                          <Key className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startImpersonation(user.id, user.name, user.email)}
                          className="h-8 px-2"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>

                        {!user.email_confirmed && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => confirmUserEmail(user.id)}
                            className="h-8 px-2"
                          >
                            <MailCheck className="w-3 h-3" />
                          </Button>
                        )}

                        {!user.has_profile && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => createMissingProfile(user.id)}
                            className="h-8 px-2"
                          >
                            <UserPlus className="w-3 h-3" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openTrialModal(user.id)}
                          disabled={trialLoading}
                          className="h-8 px-2"
                        >
                          <Clock className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivatePermanent(user.id)}
                          disabled={trialLoading}
                          className="h-8 px-2"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={trialLoading}
                              className="h-8 px-2"
                            >
                              <ShieldX className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desabilitar usuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Este usuário será desabilitado e não poderá mais acessar o sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDisableUser(user.id)}
                              >
                                Desabilitar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Troca de Senha */}
      <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha do Usuário</DialogTitle>
            <DialogDescription>
              Digite a nova senha para o usuário selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordChangeOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Usuário */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Digite o nome do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Digite o email do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-password">Senha</Label>
              <Input
                id="user-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Digite a senha do usuário"
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-role">Papel</Label>
              <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={isCreatingUser || !newUserEmail || !newUserPassword || !newUserName}
            >
              {isCreatingUser ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Período de Teste */}
      <Dialog open={trialModalOpen} onOpenChange={setTrialModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurar Período de Teste</DialogTitle>
            <DialogDescription>
              Defina quantos dias o usuário terá acesso em período de teste.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="trial-days">Dias de Teste</Label>
              <Input
                id="trial-days"
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                placeholder="Digite o número de dias"
                min="1"
                max="365"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSetTrial}
              disabled={trialLoading || !trialDays}
            >
              {trialLoading ? 'Configurando...' : 'Configurar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}