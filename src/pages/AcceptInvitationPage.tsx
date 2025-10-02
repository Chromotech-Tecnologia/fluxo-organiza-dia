import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeamInvitations } from '@/hooks/useTeamInvitations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { acceptInvitation } = useTeamInvitations();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Token de convite inválido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: inviteError } = await supabase
          .from('team_invitations')
          .select(`
            *,
            sender:profiles!team_invitations_sender_user_id_fkey(name, email)
          `)
          .eq('invitation_token', token)
          .single();

        if (inviteError || !data) {
          setError('Convite não encontrado');
          return;
        }

        if (data.status !== 'pending') {
          setError('Este convite já foi utilizado');
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError('Este convite expirou');
          return;
        }

        setInvitation(data);
      } catch (err: any) {
        setError('Erro ao carregar convite');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    try {
      await acceptInvitation(token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Convite Aceito!</CardTitle>
            <CardDescription>
              Você agora faz parte da equipe. Redirecionando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Erro ao Aceitar Convite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Ir para Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Convite para Colaboração</CardTitle>
          <CardDescription>
            <span className="font-semibold">{invitation?.sender?.name || invitation?.sender?.email}</span>
            {' '}convidou você para fazer parte da equipe!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Ao aceitar este convite, você poderá:
            </p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Visualizar tarefas delegadas a você</li>
              <li>Gerenciar suas tarefas colaborativas</li>
              <li>Acessar funcionalidades mesmo sem conta ativa</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
              disabled={accepting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1"
              disabled={accepting}
            >
              {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aceitar Convite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}