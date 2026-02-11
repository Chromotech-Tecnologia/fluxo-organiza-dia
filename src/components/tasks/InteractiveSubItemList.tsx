
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Check, X, Circle, Trash2, ExternalLink, Tag, Calendar } from "lucide-react";
import { SubItem } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Regex para detectar URLs
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

// Componente para renderizar texto com links clicáveis
function TextWithLinks({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          urlRegex.lastIndex = 0;
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {part.length > 40 ? part.substring(0, 40) + '...' : part}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

interface InteractiveSubItemListProps {
  taskId?: string;
  subItems: SubItem[];
  onSubItemsChange: (subItems: SubItem[]) => void;
}

type SubItemStatus = 'pending' | 'completed' | 'not-done';

interface SortableSubItemProps {
  subItem: SubItem;
  onStatusChange: (id: string, status: SubItemStatus) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onSubjectChange: (id: string, subject: string) => void;
  isEditing: boolean;
  onEditStart: (id: string) => void;
  onEditEnd: () => void;
  subjects: string[];
}

function SortableSubItem({ subItem, onStatusChange, onUpdate, onDelete, onSubjectChange, isEditing, onEditStart, onEditEnd, subjects }: SortableSubItemProps) {
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

  const formattedDate = subItem.createdAt
    ? format(new Date(subItem.createdAt), "dd/MM/yy", { locale: ptBR })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-1 p-3 border rounded-lg ${getStatusColor()} transition-colors min-w-0 max-w-none`}
    >
      <div className="flex items-start gap-2">
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
        
        {isEditing ? (
          <textarea
            value={subItem.text}
            onChange={(e) => onUpdate(subItem.id, e.target.value)}
            onBlur={onEditEnd}
            autoFocus
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm leading-snug min-w-0 w-full"
            placeholder="Item do checklist"
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                onEditEnd();
              }
            }}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '1.25rem',
              maxHeight: 'none',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              overflow: 'hidden',
              lineHeight: '1.25'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '1.25rem';
              target.style.height = target.scrollHeight + 'px';
            }}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = '1.25rem';
                textarea.style.height = textarea.scrollHeight + 'px';
              }
            }}
          />
        ) : (
          <div
            className="flex-1 text-sm leading-snug cursor-text min-w-0"
            onClick={() => onEditStart(subItem.id)}
          >
            <TextWithLinks text={subItem.text} />
          </div>
        )}
        
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

      {/* Subject & date row */}
      <div className="flex items-center gap-2 ml-8 flex-wrap">
        <Select
          value={subItem.subject || '__none__'}
          onValueChange={(val) => onSubjectChange(subItem.id, val === '__none__' ? '' : val)}
        >
          <SelectTrigger className="h-6 text-xs w-auto min-w-[120px] max-w-[200px] border-dashed">
            <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Assunto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sem assunto</SelectItem>
            {subjects.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formattedDate && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}

export function InteractiveSubItemList({ taskId, subItems, onSubItemsChange }: InteractiveSubItemListProps) {
  const storageKey = taskId ? `checklist-prefs-${taskId}` : null;

  const loadPrefs = () => {
    if (!storageKey) return { hideCompleted: false, hideNotDone: false, groupBySubject: false };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { hideCompleted: false, hideNotDone: false, groupBySubject: false };
  };

  const [newItemText, setNewItemText] = useState('');
  const [newItemSubject, setNewItemSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const initialPrefs = loadPrefs();
  const [hideCompleted, setHideCompleted] = useState(initialPrefs.hideCompleted);
  const [hideNotDone, setHideNotDone] = useState(initialPrefs.hideNotDone);
  const [groupBySubject, setGroupBySubject] = useState(initialPrefs.groupBySubject);

  const savePrefs = (hc: boolean, hnd: boolean, gbs: boolean) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ hideCompleted: hc, hideNotDone: hnd, groupBySubject: gbs }));
    }
  };

  const toggleHideCompleted = () => {
    const next = !hideCompleted;
    setHideCompleted(next);
    savePrefs(next, hideNotDone, groupBySubject);
  };

  const toggleHideNotDone = () => {
    const next = !hideNotDone;
    setHideNotDone(next);
    savePrefs(hideCompleted, next, groupBySubject);
  };

  const toggleGroupBySubject = () => {
    const next = !groupBySubject;
    setGroupBySubject(next);
    savePrefs(hideCompleted, hideNotDone, next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Collect all unique subjects from existing items
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    subItems.forEach(item => {
      if (item.subject) set.add(item.subject);
    });
    if (customSubject.trim() && !set.has(customSubject.trim())) {
      set.add(customSubject.trim());
    }
    return Array.from(set).sort();
  }, [subItems, customSubject]);

  const addSubItem = () => {
    if (newItemText.trim()) {
      const resolvedSubject = newItemSubject === '__custom__' ? customSubject.trim() : newItemSubject;
      const newItem: SubItem = {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
        order: subItems.length,
        subject: resolvedSubject || undefined,
        createdAt: new Date().toISOString(),
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

  const updateSubItemSubject = (id: string, subject: string) => {
    onSubItemsChange(
      subItems.map(item =>
        item.id === id ? { ...item, subject: subject || undefined } : item
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
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        order: index
      }));
      
      onSubItemsChange(updatedItems);
    }
  };

  const completedCount = subItems.filter(item => item.completed).length;
  const notDoneCount = subItems.filter(item => item.notDone).length;
  const totalCount = subItems.length;

  const filteredSubItems = subItems.filter(item => {
    if (hideCompleted && item.completed) return false;
    if (hideNotDone && item.notDone) return false;
    return true;
  });

  const sortedItems = [...filteredSubItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Group by subject
  const groupedItems = useMemo(() => {
    if (!groupBySubject) return null;
    const groups: Record<string, SubItem[]> = {};
    sortedItems.forEach(item => {
      const key = item.subject || 'Sem assunto';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [groupBySubject, sortedItems]);

  const renderItem = (subItem: SubItem) => (
    <SortableSubItem
      key={subItem.id}
      subItem={subItem}
      onStatusChange={handleStatusChange}
      onUpdate={updateSubItem}
      onDelete={deleteSubItem}
      onSubjectChange={updateSubItemSubject}
      isEditing={editingItemId === subItem.id}
      onEditStart={(id) => setEditingItemId(id)}
      onEditEnd={() => setEditingItemId(null)}
      subjects={allSubjects}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-medium text-gray-900">Checklist</h4>
        <div className="flex items-center gap-2 flex-wrap">
          {allSubjects.length > 0 && (
            <Button
              type="button"
              variant={groupBySubject ? "default" : "outline"}
              size="sm"
              onClick={toggleGroupBySubject}
              className="text-xs h-6 px-2 gap-1"
            >
              <Tag className="h-3 w-3" />
              Agrupar
            </Button>
          )}
          {completedCount > 0 && (
            <Button
              type="button"
              variant={hideCompleted ? "default" : "outline"}
              size="sm"
              onClick={toggleHideCompleted}
              className="text-xs h-6 px-2 gap-1"
            >
              <Check className="h-3 w-3" />
              {hideCompleted ? 'Mostrar' : 'Ocultar'} feitos ({completedCount})
            </Button>
          )}
          {notDoneCount > 0 && (
            <Button
              type="button"
              variant={hideNotDone ? "default" : "outline"}
              size="sm"
              onClick={toggleHideNotDone}
              className="text-xs h-6 px-2 gap-1"
            >
              <X className="h-3 w-3" />
              {hideNotDone ? 'Mostrar' : 'Ocultar'} não feitos ({notDoneCount})
            </Button>
          )}
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount} concluídos
            </Badge>
          )}
        </div>
      </div>

      {/* Adicionar novo item */}
      <div className="space-y-2">
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
        <div className="flex gap-2 items-center">
          <Select
            value={newItemSubject || '__none__'}
            onValueChange={(val) => {
              setNewItemSubject(val === '__none__' ? '' : val);
            }}
          >
            <SelectTrigger className="h-7 text-xs w-auto min-w-[140px] max-w-[200px]">
              <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Assunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem assunto</SelectItem>
              {allSubjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
              <SelectItem value="__custom__">+ Novo assunto</SelectItem>
            </SelectContent>
          </Select>
          {newItemSubject === '__custom__' && (
            <Input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Nome do assunto"
              className="h-7 text-xs flex-1 max-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Lista de itens */}
      {sortedItems.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            {groupedItems ? (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([subject, items]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{subject}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{items.length}</Badge>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-muted">
                      {items.map(renderItem)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedItems.map(renderItem)}
              </div>
            )}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
