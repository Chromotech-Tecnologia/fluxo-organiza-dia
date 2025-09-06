import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useModalStore } from '@/stores/useModalStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, CheckCircle, Clock, Users, Target, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/modals/TaskModal';

interface UserData {
  tasks: any[];
  people: any[];
  skills: any[];
  teamMembers: any[];
  dailyReports: any[];
}

export function UserDataViewer() {
  const { allUsers, isAdmin } = useUserRoles();
  const { openTaskModal } = useModalStore();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [tasksRes, peopleRes, skillsRes, teamMembersRes, dailyReportsRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('people').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('skills').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('daily_reports').select('*').eq('user_id', userId).order('date', { ascending: false })
      ]);

      setUserData({
        tasks: tasksRes.data || [],
        people: peopleRes.data || [],
        skills: skillsRes.data || [],
        teamMembers: teamMembersRes.data || [],
        dailyReports: dailyReportsRes.data || []
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: any) => {
    // Converter o task da base de dados para o formato Task esperado
    const taskForModal = {
      ...task,
      timeInvestment: task.time_investment || 'low',
      scheduledDate: task.scheduled_date,
      assignedPersonId: task.assigned_person_id,
      isRoutine: task.is_routine || false,
      isConcluded: task.is_concluded || false,
      isForwarded: task.is_forwarded || false,
      forwardCount: task.forward_count || 0,
      customTimeMinutes: task.custom_time_minutes,
      deliveryDates: task.delivery_dates || [],
      subItems: task.sub_items || [],
      completionHistory: task.completion_history || [],
      forwardHistory: task.forward_history || [],
      routineConfig: task.routine_config,
      orderIndex: task.order_index || 0,
      concludedAt: task.concluded_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
    openTaskModal(taskForModal as Task);
  };

  useEffect(() => {
    if (selectedUserId) {
      loadUserData(selectedUserId);
    }
  }, [selectedUserId]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Você não tem permissão para visualizar estes dados.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedUser = allUsers.find(user => user.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Visualizar Dados dos Usuários</h2>
        <p className="text-muted-foreground">Veja todos os dados cadastrados por cada usuário</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Usuário</CardTitle>
          <CardDescription>Escolha um usuário para visualizar seus dados</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {allUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email} - {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && userData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Dados de {selectedUser.name || selectedUser.email}
              </CardTitle>
              <CardDescription>
                Usuário criado {formatDistanceToNow(new Date(selectedUser.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.tasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pessoas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.people.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habilidades</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.skills.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipe</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.teamMembers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.dailyReports.length}</div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                <TabsTrigger value="people">Pessoas</TabsTrigger>
                <TabsTrigger value="skills">Habilidades</TabsTrigger>
                <TabsTrigger value="team">Equipe</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas ({userData.tasks.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma tarefa encontrada para este usuário.
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {userData.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => handleEditTask(task)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="people">
                <Card>
                  <CardHeader>
                    <CardTitle>Pessoas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Cargo</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Departamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userData.people.map((person) => (
                          <TableRow key={person.id}>
                            <TableCell className="font-medium">{person.name}</TableCell>
                            <TableCell>{person.role}</TableCell>
                            <TableCell>{person.email}</TableCell>
                            <TableCell>{person.department}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Habilidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Nível</TableHead>
                          <TableHead>Descrição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userData.skills.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell className="font-medium">{skill.name}</TableCell>
                            <TableCell>{skill.category}</TableCell>
                            <TableCell>
                              <Badge>{skill.level}</Badge>
                            </TableCell>
                            <TableCell>{skill.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle>Membros da Equipe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Cargo</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userData.teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.department}</TableCell>
                            <TableCell>
                              <Badge variant={member.status === 'ativo' ? 'default' : 'secondary'}>
                                {member.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatórios Diários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Concluídas</TableHead>
                          <TableHead>Taxa de Conclusão</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userData.dailyReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {new Date(report.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>{report.total_tasks}</TableCell>
                            <TableCell>{report.completed_tasks}</TableCell>
                            <TableCell>
                              <Badge variant={Number(report.completion_rate) > 80 ? 'default' : 'secondary'}>
                                {Number(report.completion_rate).toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* Modal de Tarefa */}
      <TaskModal />
    </div>
  );
}