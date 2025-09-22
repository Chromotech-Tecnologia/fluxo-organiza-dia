import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserRoles } from '@/hooks/useUserRoles';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { EmailConfirmationModal } from '@/components/modals/EmailConfirmationModal';
import { useModalStore } from '@/stores/useModalStore';
import logoHorizontal from '@/assets/logo-horizontal.png';

export const SignInPage = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isAdmin, checkIsAdmin } = useUserRoles();
  const [searchParams] = useSearchParams();
  const { 
    isEmailConfirmationModalOpen, 
    emailConfirmationData, 
    closeEmailConfirmationModal 
  } = useModalStore();

  useEffect(() => {
    if (user) {
      // Check if user is admin to determine redirect
      checkIsAdmin().then((adminStatus) => {
        // Use replace instead of navigate to avoid back button issues
        navigate(adminStatus ? '/admin' : '/dashboard', { replace: true });
      });
    }
    
    // Verificar se é uma redefinição de senha
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setCurrentView('reset-password');
    }
  }, [user, navigate, searchParams, checkIsAdmin]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onToggleMode={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm onToggleMode={() => setCurrentView('login')} />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
        );
      case 'reset-password':
        return <ResetPasswordForm />;
      default:
        return (
          <LoginForm 
            onToggleMode={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Marketing/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={logoHorizontal} alt="Logo" className="w-80 h-auto opacity-20" />
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 text-foreground">
              Organize sua vida e trabalho
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              A plataforma completa para gerenciar tarefas, equipes e projetos de forma eficiente.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-lg text-foreground">Gestão inteligente de tarefas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-lg text-foreground">Colaboração em equipe</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-lg text-foreground">Relatórios e analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-lg text-foreground">Interface intuitiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Header with Logo and Home Link */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex justify-between items-center w-full mb-6">
              <button
                onClick={() => navigate('/landing')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Voltar para home</span>
              </button>
            </div>
            
            <img 
              src={logoHorizontal} 
              alt="Organize-se" 
              className="h-16 w-auto mb-2"
            />
            <h2 className="text-2xl font-semibold text-center">
              {currentView === 'login' ? 'Bem-vindo de volta!' : 
               currentView === 'register' ? 'Crie sua conta' :
               currentView === 'forgot-password' ? 'Recuperar senha' : 'Redefinir senha'}
            </h2>
          </div>
          
          {renderCurrentView()}
          
          <EmailConfirmationModal
            isOpen={isEmailConfirmationModalOpen}
            onClose={closeEmailConfirmationModal}
            email={emailConfirmationData?.email}
            isRegistration={emailConfirmationData?.isRegistration}
          />
        </div>
      </div>
    </div>
  );
};