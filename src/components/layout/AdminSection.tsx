import { NavLink } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Shield } from "lucide-react";
export function AdminSection() {
  const {
    isAdmin
  } = useUserRoles();
  if (!isAdmin) return null;
  return <SidebarGroup>
      <SidebarGroupLabel>Administração</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/admin" className={({
              isActive
            }) => isActive ? "bg-green-100 text-primary font-medium border-l-4 border-primary" : "hover:bg-green-100 text-black transition-all duration-200"}>
                <Shield />
                <span className="text-slate-500">Painel Admin</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
}