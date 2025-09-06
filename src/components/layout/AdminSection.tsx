import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  if (!isAdmin) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administração</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/admin'}>
              <Link to="/admin">
                <Shield />
                <span>Painel Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}