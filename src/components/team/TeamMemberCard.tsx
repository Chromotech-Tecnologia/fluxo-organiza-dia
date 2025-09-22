
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/types";
import { Mail, Phone, Edit, Trash2, MapPin, Users } from "lucide-react";
import { useModalStore } from "@/stores/useModalStore";

interface TeamMemberCardProps {
  teamMember: TeamMember;
  onEdit: (teamMember: TeamMember) => void;
  onDelete: (teamMember: TeamMember) => void;
}

export function TeamMemberCard({ teamMember, onEdit, onDelete }: TeamMemberCardProps) {
  const { openTeamMemberModal } = useModalStore();

  const handleCardClick = () => {
    openTeamMemberModal(teamMember);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(teamMember);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(teamMember);
  };

  const getProjectStats = () => {
    const stats = {
      apresentado: 0,
      cotado: 0,
      iniciado: 0,
      finalizado: 0,
    };

    teamMember.projects?.forEach(project => {
      stats[project.status]++;
    });

    return stats;
  };

  const stats = getProjectStats();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{teamMember.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{teamMember.role}</p>
          </div>
          <div className="flex gap-1">
            <Badge variant={teamMember.status === 'ativo' ? 'default' : 'secondary'}>
              {teamMember.status}
            </Badge>
            {teamMember.isPartner && (
              <Badge variant="outline">Sócio</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full">
        <div className="space-y-3 flex-1">
          {/* Contato */}
          {(teamMember.email || teamMember.phone) && (
            <div className="space-y-1">
              {teamMember.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{teamMember.email}</span>
                </div>
              )}
              {teamMember.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{teamMember.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Endereço */}
          {teamMember.address && (teamMember.address.city || teamMember.address.state) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{teamMember.address.city}{teamMember.address.city && teamMember.address.state && ', '}{teamMember.address.state}</span>
            </div>
          )}

          {/* Origem */}
          {teamMember.origin && (
            <div className="text-sm">
              <span className="text-muted-foreground">Origem: </span>
              <span>{teamMember.origin}</span>
            </div>
          )}

          {/* Habilidades */}
          {teamMember.skillIds && teamMember.skillIds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Habilidades</span>
              </div>
              <Badge variant="secondary">
                {teamMember.skillIds.length} habilidade{teamMember.skillIds.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {/* Projetos Stats */}
          {teamMember.projects && teamMember.projects.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Projetos</div>
              <div className="flex gap-1 flex-wrap">
                {stats.apresentado > 0 && <Badge variant="outline" className="text-xs">A: {stats.apresentado}</Badge>}
                {stats.cotado > 0 && <Badge variant="outline" className="text-xs">C: {stats.cotado}</Badge>}
                {stats.iniciado > 0 && <Badge variant="outline" className="text-xs">I: {stats.iniciado}</Badge>}
                {stats.finalizado > 0 && <Badge variant="outline" className="text-xs">F: {stats.finalizado}</Badge>}
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
