
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { SubItem } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubItemKanbanProps {
  subItems: SubItem[];
  onSubItemsChange: (subItems: SubItem[]) => void;
}

interface SortableSubItemProps {
  subItem: SubItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

function SortableSubItem({ subItem, onToggle, onDelete, onUpdate }: SortableSubItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: subItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 border rounded-md bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Checkbox
        checked={subItem.completed}
        onCheckedChange={() => onToggle(subItem.id)}
      />
      
      <Input
        value={subItem.text}
        onChange={(e) => onUpdate(subItem.id, e.target.value)}
        className="flex-1"
        placeholder="Item do checklist"
        onKeyDown={(e) => {
          e.stopPropagation(); // Impedir que o evento suba para o formulário pai
        }}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(subItem.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SubItemKanban({ subItems, onSubItemsChange }: SubItemKanbanProps) {
  const [newItemText, setNewItemText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const addSubItem = () => {
    if (newItemText.trim()) {
      const newItem: SubItem = {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false, // Sempre criar pendente
      };
      
      onSubItemsChange([...subItems, newItem]);
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Impedir submit do formulário
      e.stopPropagation(); // Impedir propagação do evento
      addSubItem();
    }
  };

  const toggleSubItem = (id: string) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteSubItem = (id: string) => {
    onSubItemsChange(subItems.filter(item => item.id !== id));
  };

  const updateSubItem = (id: string, text: string) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subItems.findIndex(item => item.id === active.id);
      const newIndex = subItems.findIndex(item => item.id === over?.id);
      
      onSubItemsChange(arrayMove(subItems, oldIndex, newIndex));
    }
  };

  const completedCount = subItems.filter(item => item.completed).length;
  const totalCount = subItems.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Checklist</h4>
        {totalCount > 0 && (
          <Badge variant="secondary">
            {completedCount}/{totalCount} concluídos
          </Badge>
        )}
      </div>

      {/* Adicionar novo item */}
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item ao checklist"
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addSubItem}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de itens */}
      {subItems.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={subItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {subItems.map((subItem) => (
                <SortableSubItem
                  key={subItem.id}
                  subItem={subItem}
                  onToggle={toggleSubItem}
                  onDelete={deleteSubItem}
                  onUpdate={updateSubItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
