import { create } from 'zustand';
import { Task, Person, Skill, TeamMember } from '@/types';

interface ModalState {
  // Task Modal
  isTaskModalOpen: boolean;
  taskToEdit: Task | null;
  openTaskModal: (task?: Task) => void;
  closeTaskModal: () => void;
  
  // Person Modal
  isPersonModalOpen: boolean;
  personToEdit: Person | null;
  openPersonModal: (person?: Person) => void;
  closePersonModal: () => void;
  
  // Delete Confirmation Modal
  isDeleteModalOpen: boolean;
  deleteType: 'task' | 'person' | 'skill' | 'teamMember' | null;
  itemToDelete: (Task | Person | Skill | TeamMember) | null;
  openDeleteModal: (type: 'task' | 'person' | 'skill' | 'teamMember', item: Task | Person | Skill | TeamMember) => void;
  closeDeleteModal: () => void;
  
  // Daily Close Modal
  isDailyCloseModalOpen: boolean;
  selectedCloseDate: string | null;
  openDailyCloseModal: (date?: string) => void;
  closeDailyCloseModal: () => void;
  
  // Skill Modal
  isSkillModalOpen: boolean;
  skillToEdit: Skill | null;
  openSkillModal: (skill?: Skill) => void;
  closeSkillModal: () => void;
  
  // Team Member Modal
  isTeamMemberModalOpen: boolean;
  teamMemberToEdit: TeamMember | null;
  openTeamMemberModal: (teamMember?: TeamMember) => void;
  closeTeamMemberModal: () => void;
  
  // Unified Reschedule Modal
  isRescheduleModalOpen: boolean;
  tasksToReschedule: Task[] | null;
  openRescheduleModal: (tasks: Task | Task[]) => void;
  closeRescheduleModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  // Task Modal
  isTaskModalOpen: false,
  taskToEdit: null,
  openTaskModal: (task) => set({ isTaskModalOpen: true, taskToEdit: task || null }),
  closeTaskModal: () => set({ isTaskModalOpen: false, taskToEdit: null }),
  
  // Person Modal
  isPersonModalOpen: false,
  personToEdit: null,
  openPersonModal: (person) => set({ isPersonModalOpen: true, personToEdit: person || null }),
  closePersonModal: () => set({ isPersonModalOpen: false, personToEdit: null }),
  
  // Delete Confirmation Modal
  isDeleteModalOpen: false,
  deleteType: null,
  itemToDelete: null,
  openDeleteModal: (type, item) => set({ 
    isDeleteModalOpen: true, 
    deleteType: type, 
    itemToDelete: item 
  }),
  closeDeleteModal: () => set({ 
    isDeleteModalOpen: false, 
    deleteType: null, 
    itemToDelete: null 
  }),
  
  // Daily Close Modal
  isDailyCloseModalOpen: false,
  selectedCloseDate: null,
  openDailyCloseModal: (date?: string) => set({ 
    isDailyCloseModalOpen: true, 
    selectedCloseDate: date || new Date().toISOString().split('T')[0] 
  }),
  closeDailyCloseModal: () => set({ 
    isDailyCloseModalOpen: false, 
    selectedCloseDate: null 
  }),
  
  // Skill Modal
  isSkillModalOpen: false,
  skillToEdit: null,
  openSkillModal: (skill) => set({ isSkillModalOpen: true, skillToEdit: skill || null }),
  closeSkillModal: () => set({ isSkillModalOpen: false, skillToEdit: null }),
  
  // Team Member Modal
  isTeamMemberModalOpen: false,
  teamMemberToEdit: null,
  openTeamMemberModal: (teamMember) => set({ isTeamMemberModalOpen: true, teamMemberToEdit: teamMember || null }),
  closeTeamMemberModal: () => set({ isTeamMemberModalOpen: false, teamMemberToEdit: null }),
  
  // Unified Reschedule Modal
  isRescheduleModalOpen: false,
  tasksToReschedule: null,
  openRescheduleModal: (tasks) => set({ 
    isRescheduleModalOpen: true, 
    tasksToReschedule: Array.isArray(tasks) ? tasks : [tasks]
  }),
  closeRescheduleModal: () => set({ 
    isRescheduleModalOpen: false, 
    tasksToReschedule: null 
  }),
}));
