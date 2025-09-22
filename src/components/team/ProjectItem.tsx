import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from '@/types';
import { GripVertical, Check, X, Edit2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectItemProps {
  project: Project;
  onUpdate: (projectId: string, updates: Partial<Project>) => void;
  onRemove: (projectId: string) => void;
}

export function ProjectItem({ project, onUpdate, onRemove }: ProjectItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editStatus, setEditStatus] = useState(project.status);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(project.id, { 
        name: editName.trim(), 
        status: editStatus as Project['status']
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(project.name);
    setEditStatus(project.status);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setEditStatus(newStatus as Project['status']);
    if (!isEditing) {
      onUpdate(project.id, { status: newStatus as Project['status'] });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-muted p-2 rounded border"
    >
      <div className="flex items-center gap-2 flex-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-grab active:cursor-grabbing p-1 h-auto"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
            />
            <Select value={editStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apresentado">Apresentado</SelectItem>
                <SelectItem value="cotado">Cotado</SelectItem>
                <SelectItem value="iniciado">Iniciado</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm flex-1">{project.name}</span>
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apresentado">Apresentado</SelectItem>
                <SelectItem value="cotado">Cotado</SelectItem>
                <SelectItem value="iniciado">Iniciado</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(project.id)}
        className="h-8 w-8 p-0 ml-2"
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}