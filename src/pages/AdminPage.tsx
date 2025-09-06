import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserManagement } from '@/components/admin/UserManagement';
import { UserDataViewer } from '@/components/admin/UserDataViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, loading, checkIsAdmin } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    checkIsAdmin().then(adminStatus => {
      if (!adminStatus && !loading) {
        navigate('/');
      }
    });
  }, [checkIsAdmin, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o painel administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie usuários e visualize todos os dados do sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="data">Dados dos Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <UserDataViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}