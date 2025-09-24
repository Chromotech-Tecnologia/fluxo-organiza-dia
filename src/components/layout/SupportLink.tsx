import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SupportLink() {
  const handleContactSupport = () => {
    const message = encodeURIComponent(
      'Olá! Preciso de ajuda com o sistema Organize-se.'
    );
    window.open(`https://wa.me/5511969169869?text=${message}`, '_blank');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleContactSupport}
      className="gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Suporte
    </Button>
  );
}