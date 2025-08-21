
import { Task, TaskFilter } from "@/types";

// Mock task service for Dashboard compatibility
export const taskService = {
  async getTasks(filters?: TaskFilter): Promise<Task[]> {
    // This is a placeholder - in a real app this would fetch from an API
    console.log('Mock taskService.getTasks called with filters:', filters);
    return [];
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    console.log('Mock taskService.updateTask called:', id, updates);
    return null;
  },

  async deleteTask(id: string): Promise<boolean> {
    console.log('Mock taskService.deleteTask called:', id);
    return true;
  },

  async reorderTask(id: string, direction: 'up' | 'down'): Promise<boolean> {
    console.log('Mock taskService.reorderTask called:', id, direction);
    return true;
  }
};
