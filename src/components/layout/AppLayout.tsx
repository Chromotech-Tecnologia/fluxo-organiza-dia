import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeProvider } from "next-themes";
import { ImpersonationBar } from "@/components/admin/ImpersonationBar";
import { DisabledUserModal } from "@/components/auth/DisabledUserModal";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { PendingInvitationBanner } from "@/components/invitations/PendingInvitationBanner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useImpersonation } from "@/hooks/useImpersonation";
import { useUserStatus } from "@/hooks/useUserStatus";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore();
  const { isImpersonating } = useImpersonation();
  const { isUserDisabled, loading: statusLoading } = useUserStatus();

  // Se usuário está desabilitado, mostrar modal de bloqueio
  if (isUserDisabled && !statusLoading) {
    return (
      <ThemeProvider defaultTheme="light" enableSystem>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <main className="flex-1 flex flex-col min-w-0">
              {isImpersonating && <ImpersonationBar />}
              <header className="h-12 md:h-14 border-b border-border flex items-center px-3 md:px-4 bg-card sticky top-0 z-30">
                <SidebarTrigger className="mr-3 h-9 w-9 md:h-7 md:w-7" />
                <div className="flex items-center justify-between w-full min-w-0">
                  <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                    Organize-se
                  </h1>
                </div>
              </header>
              <div className="flex-1 p-3 md:p-6 overflow-auto">
                {children}
              </div>
            </main>
          </div>
          <DisabledUserModal 
            open={true} 
            userName={user?.user_metadata?.name || user?.email || 'usuário'} 
          />
        </SidebarProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col min-w-0">
            {/* Impersonation Bar */}
            {isImpersonating && <ImpersonationBar />}
            
            {/* Pending Invitations Banner */}
            <PendingInvitationBanner />
            
            {/* Header */}
            <header className="h-12 md:h-14 border-b border-border flex items-center px-3 md:px-4 bg-card sticky top-0 z-30">
              <SidebarTrigger className="mr-3 h-9 w-9 md:h-7 md:w-7" />
              <div className="flex items-center justify-between w-full min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
                  Organize-se
                </h1>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className="sm:hidden text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </header>
            
            {/* Content */}
            <div className="flex-1 p-3 md:p-6 overflow-auto">
              <TrialBanner />
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}