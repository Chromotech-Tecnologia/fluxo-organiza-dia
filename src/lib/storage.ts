// Sistema de armazenamento local para o controle de tarefas

import { Task, Person, DailyReport } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'tasks-control-tasks',
  PEOPLE: 'tasks-control-people',
  DAILY_REPORTS: 'tasks-control-daily-reports',
  APP_SETTINGS: 'tasks-control-settings'
} as const;

// Utilitários gerais de storage
export const storage = {
  get: <T>(key: string): T[] => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return [];
    }
  },

  set: <T>(key: string, data: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  },

  clear: (key: string): void => {
    localStorage.removeItem(key);
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

// Funções específicas para tarefas
export const taskStorage = {
  getAll: (): Task[] => storage.get<Task>(STORAGE_KEYS.TASKS),
  
  save: (tasks: Task[]): void => storage.set(STORAGE_KEYS.TASKS, tasks),
  
  add: (task: Task): void => {
    const tasks = taskStorage.getAll();
    tasks.push(task);
    taskStorage.save(tasks);
  },
  
  update: (taskId: string, updatedTask: Partial<Task>): void => {
    const tasks = taskStorage.getAll();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask, updatedAt: new Date().toISOString() };
      taskStorage.save(tasks);
    }
  },
  
  delete: (taskId: string): void => {
    const tasks = taskStorage.getAll().filter(t => t.id !== taskId);
    taskStorage.save(tasks);
  },
  
  getByDate: (date: string): Task[] => {
    return taskStorage.getAll().filter(task => task.scheduledDate === date);
  },
  
  getByPerson: (personId: string): Task[] => {
    return taskStorage.getAll().filter(task => task.assignedPersonId === personId);
  }
};

// Funções específicas para pessoas
export const peopleStorage = {
  getAll: (): Person[] => storage.get<Person>(STORAGE_KEYS.PEOPLE),
  
  save: (people: Person[]): void => storage.set(STORAGE_KEYS.PEOPLE, people),
  
  add: (person: Person): void => {
    const people = peopleStorage.getAll();
    people.push(person);
    peopleStorage.save(people);
  },
  
  update: (personId: string, updatedPerson: Partial<Person>): void => {
    const people = peopleStorage.getAll();
    const index = people.findIndex(p => p.id === personId);
    if (index !== -1) {
      people[index] = { ...people[index], ...updatedPerson, updatedAt: new Date().toISOString() };
      peopleStorage.save(people);
    }
  },
  
  delete: (personId: string): void => {
    const people = peopleStorage.getAll().filter(p => p.id !== personId);
    peopleStorage.save(people);
  },
  
  getById: (personId: string): Person | undefined => {
    return peopleStorage.getAll().find(p => p.id === personId);
  }
};

// Funções específicas para relatórios diários
export const dailyReportStorage = {
  getAll: (): DailyReport[] => storage.get<DailyReport>(STORAGE_KEYS.DAILY_REPORTS),
  
  save: (reports: DailyReport[]): void => storage.set(STORAGE_KEYS.DAILY_REPORTS, reports),
  
  add: (report: DailyReport): void => {
    const reports = dailyReportStorage.getAll();
    reports.push(report);
    dailyReportStorage.save(reports);
  },
  
  getByDate: (date: string): DailyReport | undefined => {
    return dailyReportStorage.getAll().find(r => r.date === date);
  },
  
  update: (date: string, updatedReport: Partial<DailyReport>): void => {
    const reports = dailyReportStorage.getAll();
    const index = reports.findIndex(r => r.date === date);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updatedReport };
      dailyReportStorage.save(reports);
    }
  }
};

// Utilitários para backup e restore
export const backupRestore = {
  exportData: () => {
    const data = {
      tasks: taskStorage.getAll(),
      people: peopleStorage.getAll(),
      dailyReports: dailyReportStorage.getAll(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-tarefas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importData: (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.tasks) taskStorage.save(data.tasks);
          if (data.people) peopleStorage.save(data.people);
          if (data.dailyReports) dailyReportStorage.save(data.dailyReports);
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }
};