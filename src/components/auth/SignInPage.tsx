import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { EmailConfirmationModal } from '@/components/modals/EmailConfirmationModal';
import { useModalStore } from '@/stores/useModalStore';

export const SignInPage = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const { 
    isEmailConfirmationModalOpen, 
    emailConfirmationData, 
    closeEmailConfirmationModal 
  } = useModalStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    
    // Verificar se é uma redefinição de senha
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setCurrentView('reset-password');
    }
  }, [user, navigate, searchParams]);

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/62746c0f-6206-4a0e-9672-06fa744bddf2.png" 
            alt="Organize-se" 
            className="h-20 w-auto"
          />
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
  );
};