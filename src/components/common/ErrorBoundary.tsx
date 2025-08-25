
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log security-sensitive errors differently
    if (this.isSecurityError(error)) {
      console.error('Security Error:', {
        message: error.message,
        stack: error.stack?.substring(0, 200), // Limit stack trace exposure
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Application Error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  private isSecurityError(error: Error): boolean {
    const securityKeywords = ['xss', 'injection', 'unauthorized', 'forbidden', 'csrf'];
    return securityKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }

  private handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Algo deu errado</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>
                  Ocorreu um erro inesperado. Por favor, recarregue a página ou tente novamente mais tarde.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Detalhes do erro (desenvolvimento)</summary>
                    <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
                <Button onClick={this.handleReload} className="w-full">
                  Recarregar Página
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
