
import React, { useState, useEffect } from 'react';
import { TaskCardImproved } from "@/components/tasks/TaskCardImproved";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { Task } from "@/types";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasks(filters);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleEditTask = (id: string) => {
    console.log(`Edit task with id ${id}`);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      loadTasks(); // Refresh tasks after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await taskService.updateTask(id, { 
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? new Date().toISOString() : undefined
      });
      loadTasks(); // Refresh tasks after toggle
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleReorderTask = async (id: string, direction: 'up' | 'down') => {
    try {
      await taskService.reorderTask(id, direction);
      loadTasks();
    } catch (error) {
      console.error("Error reordering task:", error);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filters Section */}
        <div className="md:col-span-1">
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Tasks List Section */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Lista de Tarefas</h2>
            <Link to="/tasks/create">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Tarefa
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCardImproved
                key={task.id}
                task={task}
                onEdit={() => handleEditTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleComplete={(taskId, completed) => handleToggleComplete(taskId, completed)}
                onReorder={(taskId, direction) => handleReorderTask(taskId, direction)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
