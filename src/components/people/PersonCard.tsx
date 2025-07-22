import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Edit, Trash2, Users } from "lucide-react";
import { Person } from "@/types";
import { useModalStore } from "@/stores/useModalStore";

interface PersonCardProps {
  person: Person;
  taskCount?: number;
}

export function PersonCard({ person, taskCount = 0 }: PersonCardProps) {
  const { openPersonModal, openDeleteModal } = useModalStore();

  const handleEdit = () => {
    openPersonModal(person);
  };

  const handleDelete = () => {
    openDeleteModal('person', person);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isEmail = (contact: string) => {
    return contact.includes('@');
  };

  const isPhone = (contact: string) => {
    return /[\d\(\)\-\s\+]/.test(contact);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {person.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {person.role}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={person.isPartner ? "secondary" : "default"}>
                    {person.isPartner ? "Parceiro" : "Funcionário"}
                  </Badge>
                  {taskCount > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {taskCount} tarefas
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isEmail(person.contact) ? (
            <Mail className="h-4 w-4" />
          ) : isPhone(person.contact) ? (
            <Phone className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          <span className="truncate">{person.contact}</span>
        </div>
      </CardContent>
    </Card>
  );
}