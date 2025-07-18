import { create } from 'zustand';
import { Task, Person } from '@/types';

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
  deleteType: 'task' | 'person' | null;
  itemToDelete: (Task | Person) | null;
  openDeleteModal: (type: 'task' | 'person', item: Task | Person) => void;
  closeDeleteModal: () => void;
  
  // Daily Close Modal
  isDailyCloseModalOpen: boolean;
  openDailyCloseModal: () => void;
  closeDailyCloseModal: () => void;
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
  openDailyCloseModal: () => set({ isDailyCloseModalOpen: true }),
  closeDailyCloseModal: () => set({ isDailyCloseModalOpen: false }),
}));