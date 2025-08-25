import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from 'lucide-react';
import { TaskType, TaskPriority, TaskStatus, TaskTimeInvestment, TaskFormValues, SubItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { MaskedInput } from '@/components/ui/masked-input';

const taskFormSchema = z.object({
  title: z.string().min(1, {
    message: "Título é obrigatório.",
  }),
  description: z.string().optional(),
  type: z.enum(['feature', 'bug', 'chore', 'documentation', 'meeting', 'own-task', 'delegated-task']),
  priority: z.enum(['high', 'medium', 'low', 'none', 'priority', 'extreme']),
  status: z.enum(['pending', 'in progress', 'completed', 'blocked', 'not-done', 'forwarded-date', 'forwarded-person']),
  scheduledDate: z.string(),
  assignedPersonId: z.string().min(1, {
    message: "Responsável é obrigatório.",
  }),
  timeInvestment: z.enum(['low', 'medium', 'high', 'custom', 'custom-5', 'custom-30', 'custom-4h', 'custom-8h']),
  customTimeMinutes: z.number().optional(),
  category: z.enum(['personal', 'business']),
  subItems: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      text: z.string(),
      checked: z.boolean(),
      completed: z.boolean(),
      order: z.number(),
    })
  ),
  observations: z.string().optional(),
  completionHistory: z.array(z.any()).optional(),
  forwardHistory: z.array(z.any()).optional(),
  forwardCount: z.number().optional(),
  deliveryDates: z.array(z.string()).optional(),
  isRoutine: z.boolean().optional(),
  recurrence: z.any().optional(),
  order: z.number().optional(),
  isRecurrent: z.boolean().optional(),
  isForwarded: z.boolean().optional(),
  isConcluded: z.boolean().optional(),
  isProcessed: z.boolean().optional(),
  routineEndDate: z.string().optional(),
  routineStartDate: z.string().optional(),
  routineCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
});

interface TaskFormProps {
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  defaultValues?: TaskFormValues;
  people: { id: string; name: string }[];
}

export function TaskForm({ onSubmit, onCancel, defaultValues, people }: TaskFormProps) {
  const [date, setDate] = useState<Date | undefined>(defaultValues?.scheduledDate ? new Date(defaultValues?.scheduledDate) : undefined);
  const [subItems, setSubItems] = useState<SubItem[]>(defaultValues?.subItems || []);
  const [newSubItemText, setNewSubItemText] = useState('');
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      type: defaultValues?.type || 'feature',
      priority: defaultValues?.priority || 'none',
      status: defaultValues?.status || 'pending',
      scheduledDate: defaultValues?.scheduledDate || format(new Date(), "yyyy-MM-dd"),
      assignedPersonId: defaultValues?.assignedPersonId || '',
      timeInvestment: defaultValues?.timeInvestment || 'low',
      customTimeMinutes: defaultValues?.customTimeMinutes,
      category: defaultValues?.category || 'personal',
      subItems: defaultValues?.subItems || [],
      observations: defaultValues?.observations || '',
      completionHistory: defaultValues?.completionHistory || [],
      forwardHistory: defaultValues?.forwardHistory || [],
      forwardCount: defaultValues?.forwardCount || 0,
      deliveryDates: defaultValues?.deliveryDates || [],
      isRoutine: defaultValues?.isRoutine || false,
      recurrence: defaultValues?.recurrence || null,
      order: defaultValues?.order || 0,
      isRecurrent: defaultValues?.isRecurrent || false,
      isForwarded: defaultValues?.isForwarded || false,
      isConcluded: defaultValues?.isConcluded || false,
      isProcessed: defaultValues?.isProcessed || false,
      routineEndDate: defaultValues?.routineEndDate || '',
      routineStartDate: defaultValues?.routineStartDate || '',
      routineCycle: defaultValues?.routineCycle || 'daily',
    },
  });

  useEffect(() => {
    if (date) {
      form.setValue('scheduledDate', format(date, "yyyy-MM-dd"));
    }
  }, [date, form]);

  useEffect(() => {
    form.setValue('subItems', subItems);
  }, [subItems, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  const addSubItem = () => {
    if (newSubItemText.trim()) {
      const newSubItem: SubItem = {
        id: crypto.randomUUID(),
        label: newSubItemText.trim(),
        text: newSubItemText.trim(),
        checked: false,
        completed: false,
        order: subItems.length,
      };
      
      const updatedSubItems = [...subItems, newSubItem];
      setSubItems(updatedSubItems);
      form.setValue('subItems', updatedSubItems);
      setNewSubItemText('');
    }
  };

  const removeSubItem = (index: number) => {
    const updatedSubItems = [...subItems];
    updatedSubItems.splice(index, 1);
    setSubItems(updatedSubItems);
    form.setValue('subItems', updatedSubItems);
  };

  const handleSubItemChange = (index: number, value: string) => {
    const updatedSubItems = subItems.map((item, i) => {
      if (i === index) {
        return { ...item, label: value, text: value };
      }
      return item;
    });
    setSubItems(updatedSubItems);
    form.setValue('subItems', updatedSubItems);
  };

  const handleSubItemCheck = (index: number, checked: boolean) => {
    const updatedSubItems = subItems.map((item, i) => {
      if (i === index) {
        return { ...item, checked: checked, completed: checked };
      }
      return item;
    });
    setSubItems(updatedSubItems);
    form.setValue('subItems', updatedSubItems);
  };

  const onSubmitHandler = (values: TaskFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título da tarefa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalhes da tarefa..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feature">Funcionalidade</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="chore">Melhoria</SelectItem>
                      <SelectItem value="documentation">Documentação</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="own-task">Tarefa pessoal</SelectItem>
                      <SelectItem value="delegated-task">Tarefa delegada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="extreme">Extrema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in progress">Em progresso</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="blocked">Bloqueada</SelectItem>
                      <SelectItem value="not-done">Não feito</SelectItem>
                      <SelectItem value="forwarded-date">Data adiada</SelectItem>
                      <SelectItem value="forwarded-person">Pessoa adiada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedPersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Agendada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="timeInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Estimado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tempo estimado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="custom">Customizado</SelectItem>
                      <SelectItem value="custom-5">5 minutos</SelectItem>
                      <SelectItem value="custom-30">30 minutos</SelectItem>
                      <SelectItem value="custom-4h">4 horas</SelectItem>
                      <SelectItem value="custom-8h">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.getValues('timeInvestment') === 'custom' && (
              <FormField
                control={form.control}
                name="customTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Customizado (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Categoria</FormLabel>
                  <FormDescription>
                    Marque se a tarefa é pessoal ou profissional
                  </FormDescription>
                </div>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="business">Profissional</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Sub-tarefas <Badge variant="secondary">{subItems?.length || 0}</Badge></FormLabel>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Adicionar sub-tarefa"
              value={newSubItemText}
              onChange={(e) => setNewSubItemText(e.target.value)}
            />
            <Button type="button" onClick={addSubItem} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {subItems.map((subItem, index) => (
              <div key={subItem.id} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`subitem-${subItem.id}`}
                    checked={subItem.checked}
                    onCheckedChange={(checked) => handleSubItemCheck(index, !!checked)}
                  />
                  <label htmlFor={`subitem-${subItem.id}`} className="text-sm font-medium leading-none">
                    <Input
                      type="text"
                      value={subItem.label}
                      onChange={(e) => handleSubItemChange(index, e.target.value)}
                      className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                    />
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
