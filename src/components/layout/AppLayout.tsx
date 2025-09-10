import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeProvider } from "next-themes";
import { ImpersonationBar } from "@/components/admin/ImpersonationBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col">
            {/* Impersonation Bar */}
            <ImpersonationBar />
            
            {/* Header */}
            <header className="h-14 border-b border-border flex items-center px-4 bg-card">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center justify-between w-full">
                <h1 className="text-lg font-semibold text-foreground">
                  Sistema de Controle de Tarefas
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </header>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}