
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Plus, Edit, GripVertical } from "lucide-react";
import { SubItem } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSubItemProps {
  subItem: SubItem;
  onUpdate: (id: string, text: string) => void;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

function SortableSubItem({ subItem, onUpdate, onComplete, onDelete }: SortableSubItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subItem.text);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(subItem.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(subItem.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 border rounded-lg ${
        subItem.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="h-8"
            autoFocus
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`cursor-pointer ${
              subItem.completed ? 'line-through text-gray-500' : ''
            }`}
          >
            {subItem.text}
          </span>
        )}
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant={subItem.completed ? "default" : "outline"}
          onClick={() => onComplete(subItem.id, true)}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant={!subItem.completed ? "destructive" : "outline"}
          onClick={() => onComplete(subItem.id, false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface SubItemKanbanProps {
  subItems: SubItem[];
  onSubItemsChange: (subItems: SubItem[]) => void;
}

export function SubItemKanban({ subItems, onSubItemsChange }: SubItemKanbanProps) {
  const [newItemText, setNewItemText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem: SubItem = {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
        order: subItems.length
      };
      onSubItemsChange([...subItems, newItem]);
      setNewItemText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleUpdateItem = (id: string, text: string) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleCompleteItem = (id: string, completed: boolean) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    onSubItemsChange(subItems.filter(item => item.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subItems.findIndex(item => item.id === active.id);
      const newIndex = subItems.findIndex(item => item.id === over?.id);
      
      const reorderedItems = arrayMove(subItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      
      onSubItemsChange(reorderedItems);
    }
  };

  const sortedSubItems = [...subItems].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Checklist</h4>
          
          {sortedSubItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedSubItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sortedSubItems.map((subItem) => (
                    <SortableSubItem
                      key={subItem.id}
                      subItem={subItem}
                      onUpdate={handleUpdateItem}
                      onComplete={handleCompleteItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Adicionar item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-8"
            />
            <Button size="sm" onClick={handleAddItem} className="h-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
