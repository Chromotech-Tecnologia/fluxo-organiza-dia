
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabaseAuthService } from "@/lib/supabaseAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { AdminSection } from './AdminSection';
import { SupportLink } from './SupportLink';
import logoHorizontal from '@/assets/logo-horizontal.png';
import {
  Calendar,
  BarChart3,
  CheckSquare,
  Users,
  Home,
  Settings,
  FileText,
  Clock,
  TrendingUp,
  LogOut,
  Star
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

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
];

const settingsItems = [
  { title: "Configurações de Perfil", url: "/settings", icon: Settings, adminOnly: false },
  { title: "Backup", url: "/backup", icon: FileText, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuthStore();
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();

  const handleLogout = async () => {
    try {
      await supabaseAuthService.signOut();
      signOut();
      toast({
        title: 'Sucesso',
        description: 'Logout realizado com sucesso!',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout',
        variant: 'destructive',
      });
    }
  };

  const isActive = (path: string) => currentPath === path;

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? "bg-gray-100 text-gray-800 font-medium border-l-4 border-green-500" 
      : "hover:bg-gray-50 text-slate-700 hover:text-gray-800 transition-all duration-200";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          {!collapsed ? (
            <img 
              src={logoHorizontal} 
              alt="Organize-se" 
              className="h-8 w-auto"
            />
          ) : (
            <img 
              src="/logo-favicon.png" 
              alt="Organize-se" 
              className="h-6 w-6"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavClass(isActive)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão Diária */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão Diária</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dailyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavClass(isActive)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sistema */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.filter(item => {
                // Filtra baseado no adminOnly
                return !item.adminOnly || isAdmin;
              }).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavClass(isActive)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <AdminSection />
        
        {/* Support */}
        <div className="p-4">
          <SupportLink />
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="mb-2 text-xs text-slate-700">
            {!collapsed && user && <span>Olá, {user.user_metadata?.name || user.email}</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-700 hover:bg-gray-50 hover:text-gray-800"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
