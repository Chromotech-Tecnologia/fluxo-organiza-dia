import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Trash2, Mail, Phone, MapPin, Briefcase, Star } from 'lucide-react';
import { TeamMember } from '@/types';
import { useModalStore } from '@/stores/useModalStore';
import { useSkills } from '@/hooks/useSkills';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface TeamMemberCardProps {
  teamMember: TeamMember;
}

export function TeamMemberCard({ teamMember }: TeamMemberCardProps) {
  const { openTeamMemberModal, openDeleteModal } = useModalStore();
  const { skills } = useSkills();
  const { getProjectStats, getSkillsCount } = useTeamMembers();

  const projectStats = getProjectStats(teamMember);
  const skillsCount = getSkillsCount(teamMember);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSkillNames = () => {
    return teamMember.skillIds
      .map(skillId => skills.find(s => s.id === skillId)?.name)
      .filter(Boolean)
      .slice(0, 3); // Mostrar apenas 3 skills
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(teamMember.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {teamMember.name}
                {teamMember.isPartner && (
                  <Badge variant="secondary" className="text-xs">Sócio</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {teamMember.role}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={teamMember.status === 'ativo' ? 'default' : 'secondary'}
            className={teamMember.status === 'ativo' ? 'bg-green-100 text-green-800' : ''}
          >
            {teamMember.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contato */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{teamMember.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{formatPhone(teamMember.phone)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {teamMember.address.city}, {teamMember.address.state}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="truncate">{teamMember.origin}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{skillsCount} habilidade{skillsCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {getSkillNames().map((skillName, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skillName}
              </Badge>
            ))}
            {teamMember.skillIds.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{teamMember.skillIds.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Projetos */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Projetos ({projectStats.total})
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span>Apresentado:</span>
              <span className="font-medium">{projectStats.apresentado}</span>
            </div>
            <div className="flex justify-between">
              <span>Cotado:</span>
              <span className="font-medium">{projectStats.cotado}</span>
            </div>
            <div className="flex justify-between">
              <span>Iniciado:</span>
              <span className="font-medium">{projectStats.iniciado}</span>
            </div>
            <div className="flex justify-between">
              <span>Finalizado:</span>
              <span className="font-medium">{projectStats.finalizado}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openTeamMemberModal(teamMember)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDeleteModal('teamMember', teamMember)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}