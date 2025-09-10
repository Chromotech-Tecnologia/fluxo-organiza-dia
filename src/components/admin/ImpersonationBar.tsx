import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImpersonation } from '@/hooks/useImpersonation';
import { Eye, EyeOff, User } from 'lucide-react';

export function ImpersonationBar() {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-100 rounded-none border-t-0 border-l-0 border-r-0">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">
            Visualizando como: {impersonatedUser.name || impersonatedUser.email}
          </span>
          <span className="text-xs opacity-75">
            ({impersonatedUser.email})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={stopImpersonation}
          className="gap-1 bg-white hover:bg-orange-100 text-orange-900 border-orange-300"
        >
          <EyeOff className="h-3 w-3" />
          Sair da Visualização
        </Button>
      </AlertDescription>
    </Alert>
  );
}