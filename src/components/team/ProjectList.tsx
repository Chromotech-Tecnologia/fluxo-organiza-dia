import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Project } from '@/types';
import { Plus } from 'lucide-react';
import { ProjectItem } from './ProjectItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

interface ProjectListProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export function ProjectList({ projects, onProjectsChange }: ProjectListProps) {
  const [newProject, setNewProject] = useState({ name: '', status: 'apresentado' as const });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addProject = () => {
    if (newProject.name.trim()) {
      const project: Project = {
        id: crypto.randomUUID(),
        name: newProject.name.trim(),
        status: newProject.status,
      };
      
      onProjectsChange([...projects, project]);
      setNewProject({ name: '', status: 'apresentado' });
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    onProjectsChange(updatedProjects);
  };

  const removeProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    onProjectsChange(updatedProjects);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.id === active.id);
      const newIndex = projects.findIndex(p => p.id === over.id);
      
      const reorderedProjects = arrayMove(projects, oldIndex, newIndex);
      onProjectsChange(reorderedProjects);
    }
  };

  const getProjectStats = () => {
    const stats = {
      apresentado: 0,
      cotado: 0,
      iniciado: 0,
      finalizado: 0,
    };

    projects.forEach(project => {
      stats[project.status]++;
    });

    return stats;
  };

  const stats = getProjectStats();

  return (
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addProject();
            }
          }}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {projects.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhum projeto adicionado ainda
          </div>
        )}
      </div>
    </div>
  );
}