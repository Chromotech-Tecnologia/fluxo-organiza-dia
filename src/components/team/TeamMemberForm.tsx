
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MaskedInput } from '@/components/ui/masked-input';
import { TeamMember, TeamMemberFormValues, Project } from '@/types';
import { useSupabaseSkills } from '@/hooks/useSupabaseSkills';
import { cepService } from '@/lib/cep';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const teamMemberFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Cargo é obrigatório'),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    cep: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  status: z.enum(['ativo', 'inativo']),
  isPartner: z.boolean(),
  skillIds: z.array(z.string()),
  origin: z.string().optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['apresentado', 'cotado', 'iniciado', 'finalizado']),
  })),
});

interface TeamMemberFormProps {
  teamMember?: TeamMember | null;
  onSubmit: (data: TeamMemberFormValues) => void;
  onCancel: () => void;
}

export function TeamMemberForm({ teamMember, onSubmit, onCancel }: TeamMemberFormProps) {
  const { skills } = useSupabaseSkills();
  const { toast } = useToast();
  const [newProject, setNewProject] = useState({ name: '', status: 'apresentado' as const });
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [skillAreaFilter, setSkillAreaFilter] = useState('');

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: teamMember?.name || '',
      role: teamMember?.role || '',
      email: teamMember?.email || '',
      phone: teamMember?.phone || '',
      address: teamMember?.address || {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      status: teamMember?.status || 'ativo',
      isPartner: teamMember?.isPartner || false,
      skillIds: teamMember?.skillIds || [],
      origin: teamMember?.origin || '',
      projects: teamMember?.projects || [],
    },
  });

  const watchedCep = useWatch({
    control: form.control,
    name: 'address.cep'
  });

  const watchedProjects = useWatch({
    control: form.control,
    name: 'projects'
  });

  const watchedSkillIds = useWatch({
    control: form.control,
    name: 'skillIds'
  });

  // Buscar endereço automaticamente ao digitar CEP
  useEffect(() => {
    const searchCep = async () => {
      if (watchedCep && watchedCep.replace(/\D/g, '').length === 8) {
        setIsLoadingCep(true);
        try {
          const addressData = await cepService.fetchAddress(watchedCep);
          if (addressData) {
            form.setValue('address.street', addressData.logradouro);
            form.setValue('address.neighborhood', addressData.bairro);
            form.setValue('address.city', addressData.localidade);
            form.setValue('address.state', addressData.uf);
            if (addressData.complemento) {
              form.setValue('address.complement', addressData.complemento);
            }
            toast({
              title: 'Endereço encontrado',
              description: 'Dados do endereço preenchidos automaticamente.',
            });
          } else {
            toast({
              title: 'CEP não encontrado',
              description: 'CEP inválido ou não encontrado.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          toast({
            title: 'Erro',
            description: 'Erro ao buscar endereço.',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingCep(false);
        }
      }
    };

    const timeoutId = setTimeout(searchCep, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedCep, form, toast]);

  const addProject = () => {
    if (newProject.name.trim()) {
      const project: Project = {
        id: crypto.randomUUID(),
        name: newProject.name.trim(),
        status: newProject.status,
      };
      
      const currentProjects = form.getValues('projects');
      form.setValue('projects', [...currentProjects, project]);
      setNewProject({ name: '', status: 'apresentado' });
    }
  };

  const removeProject = (projectId: string) => {
    const currentProjects = form.getValues('projects');
    form.setValue('projects', currentProjects.filter(p => p.id !== projectId));
  };

  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues('skillIds');
    if (currentSkills.includes(skillId)) {
      form.setValue('skillIds', currentSkills.filter(id => id !== skillId));
    } else {
      form.setValue('skillIds', [...currentSkills, skillId]);
    }
  };

  const getProjectStats = () => {
    const stats = {
      apresentado: 0,
      cotado: 0,
      iniciado: 0,
      finalizado: 0,
    };

    watchedProjects?.forEach(project => {
      stats[project.status]++;
    });

    return stats;
  };

  const stats = getProjectStats();

  // Filtrar habilidades por área
  const availableAreas = [...new Set(skills.map(s => s.area).filter(Boolean))];
  const filteredSkills = skillAreaFilter 
    ? skills.filter(skill => skill.area === skillAreaFilter)
    : skills;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informações Básicas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="(99) 99999-9999"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="(11) 99999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPartner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Sócio</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem da Equipe</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Indicação, LinkedIn, Site..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endereço</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address.cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP {isLoadingCep && <span className="text-xs text-muted-foreground">(Buscando...)</span>}</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="99999-999"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="00000-000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Habilidades</h3>
            <Badge variant="secondary">
              {watchedSkillIds?.length || 0} selecionada{(watchedSkillIds?.length || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Select value={skillAreaFilter} onValueChange={setSkillAreaFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por área da empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as áreas</SelectItem>
                {availableAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {filteredSkills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill.id}`}
                    checked={watchedSkillIds?.includes(skill.id) || false}
                    onCheckedChange={() => toggleSkill(skill.id)}
                  />
                  <label htmlFor={`skill-${skill.id}`} className="text-sm font-medium leading-none">
                    {skill.name}
                  </label>
                </div>
              ))}
              {filteredSkills.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">
                  {skillAreaFilter ? 'Nenhuma habilidade encontrada para esta área' : 'Nenhuma habilidade cadastrada'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Projetos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Projetos</h3>
            <div className="flex gap-2">
              <Badge variant="outline">Apresentado: {stats.apresentado}</Badge>
              <Badge variant="outline">Cotado: {stats.cotado}</Badge>
              <Badge variant="outline">Iniciado: {stats.iniciado}</Badge>
              <Badge variant="outline">Finalizado: {stats.finalizado}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nome do projeto"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            />
            <Select
              value={newProject.status}
              onValueChange={(value: any) => setNewProject({ ...newProject, status: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apresentado">Apresentado</SelectItem>
                <SelectItem value="cotado">Cotado</SelectItem>
                <SelectItem value="iniciado">Iniciado</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" onClick={addProject} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {watchedProjects?.map((project) => (
              <div key={project.id} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{project.name}</span>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {teamMember ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
