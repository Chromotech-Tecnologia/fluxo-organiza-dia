import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTrialManagement } from '@/hooks/useTrialManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle } from 'lucide-react';

export function TrialBanner() {
  const { user } = useAuthStore();
  const { getTrialStatus } = useTrialManagement();
  const [trialStatus, setTrialStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getTrialStatus(user.id).then(setTrialStatus);
    }
  }, [user, getTrialStatus]);

  const handleContactSupport = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de contratar um pacote para minha conta no sistema Organize-se. Meu período de teste expira em ${trialStatus?.daysRemaining} dias.`
    );
    window.open(`https://wa.me/5511969169869?text=${message}`, '_blank');
  };

  if (!trialStatus?.isInTrial) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <Clock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800 dark:text-orange-200">
          <strong>Período de Teste:</strong> Sua conta expira em {trialStatus.daysRemaining} dias. 
          Entre em contato com o suporte e contrate um pacote.
        </span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleContactSupport}
          className="ml-4"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Contratar Pacote
        </Button>
      </AlertDescription>
    </Alert>
  );
}