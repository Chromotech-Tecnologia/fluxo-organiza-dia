import { NavLink } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

export function AdminSection() {
  const { isAdmin } = useUserRoles();

  if (!isAdmin) return null;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-emerald-50 text-emerald-700 font-semibold border-r-3 border-emerald-500 shadow-sm" 
      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200";

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-slate-500 font-medium text-xs uppercase tracking-wide mb-2">Administração</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/admin" 
                className={getNavClass}>
                <Shield className="h-4 w-4 mr-3" />
                <span className="font-medium">Painel Admin</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}