import { NavLink, useLocation } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

export function AdminSection() {
  const { isAdmin } = useUserRoles();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? "bg-gray-100 text-gray-800 font-medium border-l-4 border-green-500" 
      : "hover:bg-gray-50 text-slate-700 hover:text-gray-800 transition-all duration-200";

  if (!isAdmin) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administração</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => getNavClass(isActive)}
              >
                <Shield className="h-4 w-4 mr-2" />
                {!collapsed && <span>Painel Admin</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}