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
    <div className="px-2">
      <div className="text-slate-500 font-medium text-xs uppercase tracking-wide mb-2">Suporte</div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleContactSupport}
        className="w-full justify-start gap-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 font-medium"
      >
        <MessageCircle className="h-4 w-4" />
        Suporte
      </Button>
    </div>
  );
}