
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Check, X, Circle, Trash2 } from "lucide-react";
import { SubItem } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InteractiveSubItemListProps {
  subItems: SubItem[];
  onSubItemsChange: (subItems: SubItem[]) => void;
}

type SubItemStatus = 'pending' | 'completed' | 'not-done';

interface SortableSubItemProps {
  subItem: SubItem;
  onStatusChange: (id: string, status: SubItemStatus) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function SortableSubItem({ subItem, onStatusChange, onUpdate, onDelete }: SortableSubItemProps) {
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

  const getStatusColor = () => {
    if (subItem.completed) return 'border-green-200 bg-green-50';
    if (subItem.notDone) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 p-3 border rounded-lg ${getStatusColor()} transition-colors`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(subItem.id, 'pending')}
          className={`p-1 h-6 w-6 hover:bg-gray-100 ${!subItem.completed && !subItem.notDone ? 'bg-gray-100' : ''}`}
          title="Pendente"
        >
          <Circle className="h-4 w-4 text-gray-500" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(subItem.id, 'completed')}
          className={`p-1 h-6 w-6 hover:bg-green-100 ${subItem.completed ? 'bg-green-100' : ''}`}
          title="Feito"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(subItem.id, 'not-done')}
          className={`p-1 h-6 w-6 hover:bg-red-100 ${subItem.notDone ? 'bg-red-100' : ''}`}
          title="Não Feito"
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
      
      <textarea
        value={subItem.text}
        onChange={(e) => onUpdate(subItem.id, e.target.value)}
        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm leading-tight overflow-hidden"
        placeholder="Item do checklist"
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        rows={1}
        style={{
          height: 'auto',
          minHeight: '1.2rem'
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(subItem.id)}
        className="p-1 h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
        title="Remover item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function InteractiveSubItemList({ subItems, onSubItemsChange }: InteractiveSubItemListProps) {
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
        completed: false,
        order: subItems.length,
      };
      
      onSubItemsChange([...subItems, newItem]);
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      addSubItem();
    }
  };

  const handleStatusChange = (id: string, status: SubItemStatus) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id 
          ? { 
              ...item, 
              completed: status === 'completed',
              notDone: status === 'not-done'
            } 
          : item
      )
    );
  };

  const updateSubItem = (id: string, text: string) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const deleteSubItem = (id: string) => {
    onSubItemsChange(subItems.filter(item => item.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subItems.findIndex(item => item.id === active.id);
      const newIndex = subItems.findIndex(item => item.id === over?.id);
      
      const reorderedItems = arrayMove(subItems, oldIndex, newIndex);
      
      // Atualizar a propriedade order
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index
      }));
      
      onSubItemsChange(updatedItems);
    }
  };

  const completedCount = subItems.filter(item => item.completed).length;
  const totalCount = subItems.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Checklist</h4>
        {totalCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount} concluídos
          </Badge>
        )}
      </div>

      {/* Adicionar novo item */}
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item ao checklist (pressione Enter)"
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
              {subItems
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((subItem) => (
                  <SortableSubItem
                    key={subItem.id}
                    subItem={subItem}
                    onStatusChange={handleStatusChange}
                    onUpdate={updateSubItem}
                    onDelete={deleteSubItem}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
