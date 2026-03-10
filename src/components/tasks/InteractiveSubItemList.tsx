
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, GripVertical, Check, X, Circle, Trash2, ExternalLink, Tag, Calendar, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { SubItem } from "@/types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Cores para tags
const TAG_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  1: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  2: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  3: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  4: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  5: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  6: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  7: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

function getTagColor(subject: string, allSubjects: string[]) {
  const idx = allSubjects.indexOf(subject);
  return TAG_COLORS[idx % Object.keys(TAG_COLORS).length] || TAG_COLORS[0];
}

// Regex para detectar URLs
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

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
  const [editSubject, setEditSubject] = useState(false);
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
    return 'border-muted bg-card';
  };

  const formattedDate = subItem.createdAt
    ? format(new Date(subItem.createdAt), "dd/MM/yy", { locale: ptBR })
    : null;

  const tagColor = subItem.subject ? getTagColor(subItem.subject, subjects) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col gap-1.5 p-3 border rounded-lg ${getStatusColor()} transition-colors min-w-0 max-w-none`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 hover:bg-muted rounded mt-0.5"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(subItem.id, 'pending')}
            className={`p-1 h-6 w-6 hover:bg-muted ${!subItem.completed && !subItem.notDone ? 'bg-muted' : ''}`}
            title="Pendente"
          >
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(subItem.id, 'completed')}
            className={`p-1 h-6 w-6 hover:bg-green-100 ${subItem.completed ? 'bg-green-100' : ''}`}
            title="Feito"
          >
            <Check className="h-3.5 w-3.5 text-green-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(subItem.id, 'not-done')}
            className={`p-1 h-6 w-6 hover:bg-red-100 ${subItem.notDone ? 'bg-red-100' : ''}`}
            title="Não Feito"
          >
            <X className="h-3.5 w-3.5 text-red-600" />
          </Button>
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <textarea
              value={subItem.text}
              onChange={(e) => onUpdate(subItem.id, e.target.value)}
              onBlur={(e) => {
                // Delay to allow clicking on SubjectPicker without closing edit mode
                setTimeout(() => {
                  const active = document.activeElement;
                  const popover = document.querySelector('[data-radix-popper-content-wrapper]');
                  if (popover?.contains(active)) return;
                  // Check if focus moved to another element inside this item's edit area
                  const parent = e.target.closest('.group');
                  if (parent?.contains(document.activeElement)) return;
                  onEditEnd();
                }, 150);
              }}
              autoFocus
              className="w-full border rounded-md bg-background px-2 py-1 text-sm leading-snug min-w-0 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Item do checklist"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') onEditEnd();
              }}
              rows={1}
              style={{ height: 'auto', minHeight: '1.5rem', wordWrap: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', overflow: 'hidden', lineHeight: '1.4' }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = '1.5rem'; t.style.height = t.scrollHeight + 'px'; }}
              ref={(ta) => { if (ta) { ta.style.height = '1.5rem'; ta.style.height = ta.scrollHeight + 'px'; } }}
            />
          ) : (
            <div className="flex items-start gap-2">
              <div className={`flex-1 text-sm leading-snug min-w-0 ${subItem.completed ? 'line-through text-muted-foreground' : ''}`}>
                <TextWithLinks text={subItem.text} />
              </div>
            </div>
          )}

          {/* Tag & date row - read only */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {tagColor && subItem.subject ? (
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>
                  <Tag className="h-2.5 w-2.5" />
                  {subItem.subject}
                </span>
              ) : null}
              {formattedDate && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {formattedDate}
                </span>
              )}
            </div>
          )}

          {/* Edit mode for subject */}
          {isEditing && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <SubjectPicker
                value={subItem.subject || ''}
                subjects={subjects}
                onChange={(val) => onSubjectChange(subItem.id, val)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStart(subItem.id)}
              className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(subItem.id)}
            className="p-1 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Remover item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Popover-based subject picker
function SubjectPicker({ value, subjects, onChange }: { value: string; subjects: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const handleSelect = (subject: string) => {
    onChange(subject);
    setOpen(false);
  };

  const handleAddNew = () => {
    if (newSubject.trim()) {
      onChange(newSubject.trim());
      setNewSubject('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-dashed hover:border-solid transition-colors cursor-pointer ${
            value
              ? (() => { const c = getTagColor(value, subjects); return `${c.bg} ${c.text} ${c.border} font-medium border-solid`; })()
              : 'border-muted-foreground/30 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Tag className="h-2.5 w-2.5" />
          {value || 'Assunto'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Selecionar assunto</p>
          
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors ${!value ? 'bg-muted font-medium' : ''}`}
          >
            Sem assunto
          </button>
          
          {subjects.map(s => {
            const c = getTagColor(s, subjects);
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors flex items-center gap-1.5 ${value === s ? 'bg-muted font-medium' : ''}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${c.bg} border ${c.border}`} />
                {s}
              </button>
            );
          })}

          <div className="border-t pt-1.5 mt-1.5">
            <div className="flex gap-1">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Novo assunto..."
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') { e.preventDefault(); handleAddNew(); }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddNew} className="h-7 w-7 p-0" disabled={!newSubject.trim()}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function InteractiveSubItemList({ taskId, subItems, onSubItemsChange }: InteractiveSubItemListProps) {
  const storageKey = taskId ? `checklist-prefs-${taskId}` : null;

  const [newItemText, setNewItemText] = useState('');
  const [newItemSubject, setNewItemSubject] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hideNotDone, setHideNotDone] = useState(false);
  const [groupBySubject, setGroupBySubject] = useState(false);

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const prefs = JSON.parse(saved);
        setHideCompleted(!!prefs.hideCompleted);
        setHideNotDone(!!prefs.hideNotDone);
        setGroupBySubject(!!prefs.groupBySubject);
      }
    } catch {}
  }, [storageKey]);

  const savePrefs = (hc: boolean, hnd: boolean, gbs: boolean) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ hideCompleted: hc, hideNotDone: hnd, groupBySubject: gbs }));
    }
  };

  const toggleHideCompleted = () => { const n = !hideCompleted; setHideCompleted(n); savePrefs(n, hideNotDone, groupBySubject); };
  const toggleHideNotDone = () => { const n = !hideNotDone; setHideNotDone(n); savePrefs(hideCompleted, n, groupBySubject); };
  const toggleGroupBySubject = () => { const n = !groupBySubject; setGroupBySubject(n); savePrefs(hideCompleted, hideNotDone, n); };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    subItems.forEach(item => { if (item.subject) set.add(item.subject); });
    if (newItemSubject) set.add(newItemSubject);
    return Array.from(set).sort();
  }, [subItems, newItemSubject]);

  const addSubItem = () => {
    if (newItemText.trim()) {
      const newItem: SubItem = {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
        order: subItems.length,
        subject: newItemSubject || undefined,
        createdAt: new Date().toISOString(),
      };
      onSubItemsChange([...subItems, newItem]);
      setNewItemText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addSubItem(); }
  };

  const handleStatusChange = (id: string, status: SubItemStatus) => {
    onSubItemsChange(subItems.map(item => item.id === id ? { ...item, completed: status === 'completed', notDone: status === 'not-done' } : item));
  };

  const updateSubItem = (id: string, text: string) => {
    onSubItemsChange(subItems.map(item => item.id === id ? { ...item, text } : item));
  };

  const updateSubItemSubject = (id: string, subject: string) => {
    onSubItemsChange(subItems.map(item => item.id === id ? { ...item, subject: subject || undefined } : item));
  };

  const deleteSubItem = (id: string) => {
    onSubItemsChange(subItems.filter(item => item.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = subItems.findIndex(item => item.id === active.id);
      const newIndex = subItems.findIndex(item => item.id === over?.id);
      const reorderedItems = arrayMove(subItems, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }));
      onSubItemsChange(reorderedItems);
    }
  };

  // Tag ordering
  const moveTagUp = (subject: string) => {
    const idx = allSubjects.indexOf(subject);
    if (idx <= 0) return;
    // Swap order of items: move items with this subject before items with previous subject
    const prevSubject = allSubjects[idx - 1];
    const reordered = [...subItems];
    // Reassign orders to swap groups
    let order = 0;
    const bySubject: Record<string, SubItem[]> = {};
    const subjectOrder = [...allSubjects];
    [subjectOrder[idx - 1], subjectOrder[idx]] = [subjectOrder[idx], subjectOrder[idx - 1]];
    // Also include items without subject
    const noSubject = reordered.filter(i => !i.subject);
    subjectOrder.forEach(s => { bySubject[s] = reordered.filter(i => i.subject === s); });
    
    const result: SubItem[] = [];
    // Put no-subject items first, then grouped ones
    noSubject.forEach(item => result.push({ ...item, order: order++ }));
    subjectOrder.forEach(s => { bySubject[s]?.forEach(item => result.push({ ...item, order: order++ })); });
    onSubItemsChange(result);
  };

  const moveTagDown = (subject: string) => {
    const idx = allSubjects.indexOf(subject);
    if (idx >= allSubjects.length - 1) return;
    const reordered = [...subItems];
    let order = 0;
    const bySubject: Record<string, SubItem[]> = {};
    const subjectOrder = [...allSubjects];
    [subjectOrder[idx], subjectOrder[idx + 1]] = [subjectOrder[idx + 1], subjectOrder[idx]];
    const noSubject = reordered.filter(i => !i.subject);
    subjectOrder.forEach(s => { bySubject[s] = reordered.filter(i => i.subject === s); });
    
    const result: SubItem[] = [];
    noSubject.forEach(item => result.push({ ...item, order: order++ }));
    subjectOrder.forEach(s => { bySubject[s]?.forEach(item => result.push({ ...item, order: order++ })); });
    onSubItemsChange(result);
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
        <h4 className="font-medium text-foreground">Checklist</h4>
        <div className="flex items-center gap-1.5 flex-wrap">
          {allSubjects.length > 0 && (
            <Button type="button" variant={groupBySubject ? "default" : "outline"} size="sm" onClick={toggleGroupBySubject} className="text-xs h-6 px-2 gap-1">
              <Tag className="h-3 w-3" />
              Agrupar
            </Button>
          )}
          {completedCount > 0 && (
            <Button type="button" variant={hideCompleted ? "default" : "outline"} size="sm" onClick={toggleHideCompleted} className="text-xs h-6 px-2 gap-1">
              <Check className="h-3 w-3" />
              {hideCompleted ? 'Mostrar' : 'Ocultar'} feitos ({completedCount})
            </Button>
          )}
          {notDoneCount > 0 && (
            <Button type="button" variant={hideNotDone ? "default" : "outline"} size="sm" onClick={toggleHideNotDone} className="text-xs h-6 px-2 gap-1">
              <X className="h-3 w-3" />
              {hideNotDone ? 'Mostrar' : 'Ocultar'} não feitos ({notDoneCount})
            </Button>
          )}
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Add new item */}
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1.5">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Adicionar item ao checklist (Enter)"
            onKeyDown={handleKeyDown}
            className="h-9"
          />
          <SubjectPicker
            value={newItemSubject}
            subjects={allSubjects}
            onChange={setNewItemSubject}
          />
        </div>
        <Button type="button" onClick={addSubItem} variant="outline" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Item list */}
      {sortedItems.length > 0 && (
        <div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {groupedItems ? (
                <div className="space-y-4">
                  {Object.entries(groupedItems).map(([subject, items], groupIdx) => {
                    const isRealSubject = subject !== 'Sem assunto';
                    const tagColor = isRealSubject ? getTagColor(subject, allSubjects) : null;
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {tagColor ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>
                              <Tag className="h-2.5 w-2.5" />
                              {subject}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {subject}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[10px] h-4">{items.length}</Badge>
                          {isRealSubject && allSubjects.length > 1 && (
                            <div className="flex items-center gap-0.5 ml-auto">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveTagUp(subject)}
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                title="Mover para cima"
                                disabled={allSubjects.indexOf(subject) === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveTagDown(subject)}
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                title="Mover para baixo"
                                disabled={allSubjects.indexOf(subject) === allSubjects.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 pl-2 border-l-2 border-muted">
                          {items.map(renderItem)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedItems.map(renderItem)}
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
