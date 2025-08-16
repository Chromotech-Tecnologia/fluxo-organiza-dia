import { supabase } from '@/integrations/supabase/client';
import { taskStorage, peopleStorage, skillsStorage, teamMembersStorage, dailyReportStorage } from '@/lib/storage';
import { Task, Person, Skill, TeamMember, DailyReport } from '@/types';

export class SupabaseMigration {
  static async migrateAllData() {
    try {
      console.log('Iniciando migração de dados para Supabase...');
      
      // Migrar pessoas primeiro (pois tarefas referenciam pessoas)
      await this.migratePeople();
      
      // Migrar habilidades
      await this.migrateSkills();
      
      // Migrar membros da equipe
      await this.migrateTeamMembers();
      
      // Migrar tarefas
      await this.migrateTasks();
      
      // Migrar relatórios diários
      await this.migrateDailyReports();
      
      console.log('Migração concluída com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro na migração:', error);
      return { success: false, error };
    }
  }

  private static async migratePeople() {
    const localPeople = peopleStorage.getAll();
    console.log(`Migrando ${localPeople.length} pessoas...`);
    
    if (localPeople.length === 0) return;

    const supabasePeople = localPeople.map(person => ({
      id: person.id,
      name: person.name,
      email: null, // Person não tem email no tipo atual
      phone: null, // Person não tem phone no tipo atual
      role: person.role || null,
      department: null, // Person não tem department no tipo atual
      notes: null, // Person não tem notes no tipo atual
      active: true, // Person não tem active no tipo atual
      created_at: person.createdAt,
      updated_at: person.updatedAt
    }));

    const { error } = await supabase
      .from('people')
      .upsert(supabasePeople);

    if (error) throw error;
    console.log('Pessoas migradas com sucesso');
  }

  private static async migrateSkills() {
    const localSkills = skillsStorage.getAll();
    console.log(`Migrando ${localSkills.length} habilidades...`);
    
    if (localSkills.length === 0) return;

    const supabaseSkills = localSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.observation || null, // observation mapeado para description
      category: skill.area || null, // area mapeado para category
      level: 'beginner', // Skill não tem level no tipo atual
      created_at: skill.createdAt,
      updated_at: skill.updatedAt
    }));

    const { error } = await supabase
      .from('skills')
      .upsert(supabaseSkills);

    if (error) throw error;
    console.log('Habilidades migradas com sucesso');
  }

  private static async migrateTeamMembers() {
    const localTeamMembers = teamMembersStorage.getAll();
    console.log(`Migrando ${localTeamMembers.length} membros da equipe...`);
    
    if (localTeamMembers.length === 0) return;

    const supabaseTeamMembers = localTeamMembers.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email || null,
      phone: member.phone || null,
      role: member.role || null,
      department: null, // TeamMember não tem department no tipo atual
      skill_ids: member.skillIds || [],
      project_ids: member.projects?.map(p => p.id) || [],
      hire_date: null, // TeamMember não tem hireDate no tipo atual
      status: member.status || 'ativo',
      notes: null, // TeamMember não tem notes no tipo atual
      created_at: member.createdAt,
      updated_at: member.updatedAt
    }));

    const { error } = await supabase
      .from('team_members')
      .upsert(supabaseTeamMembers);

    if (error) throw error;
    console.log('Membros da equipe migrados com sucesso');
  }

  private static async migrateTasks() {
    const localTasks = taskStorage.getAll();
    console.log(`Migrando ${localTasks.length} tarefas...`);
    
    if (localTasks.length === 0) return;

    // Obter lista de pessoas existentes para validar referências
    const { data: existingPeople } = await supabase
      .from('people')
      .select('id');
    
    const existingPersonIds = new Set(existingPeople?.map(p => p.id) || []);

    const supabaseTasks = localTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || null,
      scheduled_date: task.scheduledDate,
      type: task.type,
      priority: task.priority,
      time_investment: task.timeInvestment || 'low',
      category: task.category || 'personal',
      status: task.status,
      // Só definir assigned_person_id se a pessoa existir na base
      assigned_person_id: (task.assignedPersonId && existingPersonIds.has(task.assignedPersonId)) 
        ? task.assignedPersonId 
        : null,
      forward_count: task.forwardCount || 0,
      observations: task.observations || null,
      sub_items: task.subItems as any || [],
      completion_history: task.completionHistory as any || [],
      forward_history: task.forwardHistory as any || [],
      delivery_dates: task.deliveryDates || [],
      is_routine: task.isRoutine || false,
      routine_config: task.recurrence as any || null,
      task_order: task.order || 0,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    }));

    // Inserir em lotes menores para evitar problemas
    for (let i = 0; i < supabaseTasks.length; i += 50) {
      const batch = supabaseTasks.slice(i, i + 50);
      const { error } = await supabase
        .from('tasks')
        .upsert(batch);
      
      if (error) throw error;
    }

    console.log('Tarefas migradas com sucesso');
  }

  private static async migrateDailyReports() {
    const localReports = dailyReportStorage.getAll();
    console.log(`Migrando ${localReports.length} relatórios diários...`);
    
    if (localReports.length === 0) return;

    const supabaseReports = localReports.map(report => ({
      date: report.date,
      total_tasks: report.totalTasks || 0,
      completed_tasks: report.completedTasks || 0,
      pending_tasks: 0, // Não existe no tipo DailyReport atual
      forwarded_tasks: report.forwardedTasks || 0,
      completion_rate: 0, // Não existe no tipo DailyReport atual
      observations: null, // Não existe no tipo DailyReport atual
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('daily_reports')
      .upsert(supabaseReports);

    if (error) throw error;
    console.log('Relatórios diários migrados com sucesso');
  }

  static async checkMigrationStatus() {
    try {
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
      
      const { count: peopleCount } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true });

      const { count: skillsCount } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });

      const { count: teamMembersCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });

      return {
        tasksInSupabase: tasksCount || 0,
        peopleInSupabase: peopleCount || 0,
        skillsInSupabase: skillsCount || 0,
        teamMembersInSupabase: teamMembersCount || 0,
        tasksInLocalStorage: taskStorage.getAll().length,
        peopleInLocalStorage: peopleStorage.getAll().length,
        skillsInLocalStorage: skillsStorage.getAll().length,
        teamMembersInLocalStorage: teamMembersStorage.getAll().length
      };
    } catch (error) {
      console.error('Erro ao verificar status da migração:', error);
      return null;
    }
  }
}