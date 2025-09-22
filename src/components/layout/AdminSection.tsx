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
              <Link to="/admin" className={location.pathname === '/admin' ? 
                "bg-green-100 text-primary font-medium border-l-4 border-primary" : 
                "hover:bg-gray-50 text-black transition-all duration-200"}>
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