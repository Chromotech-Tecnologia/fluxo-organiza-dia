import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabaseAuthService } from "@/lib/supabaseAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { AdminSection } from './AdminSection';
import { SupportLink } from './SupportLink';
import logoHorizontal from '@/assets/logo-horizontal.png';
import { Calendar, BarChart3, CheckSquare, Users, Home, Settings, FileText, Clock, TrendingUp, LogOut, Star } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tarefas", url: "/tasks", icon: CheckSquare },
  { title: "Calendário", url: "/calendar", icon: Calendar },
  { title: "Equipe", url: "/people", icon: Users },
  { title: "Skills", url: "/skills", icon: Star },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
];

const dailyItems = [
  { title: "Fechamento Diário", url: "/daily-close", icon: Clock },
  { title: "Estatísticas", url: "/stats", icon: TrendingUp },
  { title: "Gestão de Tempo", url: "/time-management", icon: BarChart3 },
];

const settingsItems = [
  { title: "Configurações", url: "/settings", icon: Settings, adminOnly: false },
  { title: "Backup", url: "/backup", icon: FileText, adminOnly: true },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuthStore();
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();

  const handleLogout = async () => {
    try {
      await supabaseAuthService.signOut();
      signOut();
      toast({ title: 'Sucesso', description: 'Logout realizado com sucesso!' });
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Erro', description: 'Erro ao fazer logout', variant: 'destructive' });
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 text-foreground font-medium"
      : "text-muted-foreground hover:bg-muted transition-all duration-200";

  const renderMenuItems = (items: typeof menuItems) =>
    items.map(item => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild size={isMobile ? "lg" : "default"}>
          <NavLink
            to={item.url}
            end={item.url === '/'}
            className={getNavClass}
            onClick={handleNavClick}
          >
            <item.icon className="h-5 w-5 md:h-4 md:w-4 mr-2 flex-shrink-0" />
            {!collapsed && <span className="text-sm md:text-sm">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          {!collapsed ? (
            <img src={logoHorizontal} alt="Organize-se" className="h-8 w-auto" />
          ) : (
            <img src="/logo-favicon.png" alt="Organize-se" className="h-6 w-6" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(menuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestão Diária</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(dailyItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems
                .filter(item => !item.adminOnly || isAdmin)
                .map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size={isMobile ? "lg" : "default"}>
                      <NavLink to={item.url} className={getNavClass} onClick={handleNavClick}>
                        <item.icon className="h-5 w-5 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <AdminSection />

        <div className="p-4">
          <SupportLink />
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <div className="mb-2 text-xs text-muted-foreground">
            {!collapsed && user && <span>Olá, {user.user_metadata?.name || user.email}</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-muted/50 transition-all duration-200 h-10 md:h-8"
          >
            <LogOut className="h-5 w-5 md:h-4 md:w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
