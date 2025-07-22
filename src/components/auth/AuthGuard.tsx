interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // Por enquanto, sem autenticação - retorna diretamente os children
  return <>{children}</>;
}