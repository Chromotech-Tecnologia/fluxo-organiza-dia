
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PeopleSelect } from '@/components/people/PeopleSelect';
import { Task, TaskFormValues } from '@/types';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['own-task', 'meeting', 'delegated-task']),
  priority: z.enum(['none', 'priority', 'extreme']),
  timeInvestment: z.enum(['low', 'medium', 'high']),
  category: z.enum(['personal', 'business']),
  scheduledDate: z.string(),
  assignedPersonId: z.string().optional(),
  observations: z.string().optional(),
  order: z.number().min(1, 'Ordem deve ser maior que 0'),
  isRoutine: z.boolean().default(false),
  routineCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
  routineStartDate: z.string().optional(),
  routineEndDate: z.string().optional(),
  subItems: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Item não pode estar vazio'),
    completed: z.boolean(),
    order: z.number()
  })),
});

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { tasks } = useSupabaseTasks({
    dateRange: task ? {
      start: task.scheduledDate,
      end: task.scheduledDate
    } : {
      start: getCurrentDateInSaoPaulo(),
      end: getCurrentDateInSaoPaulo()
    }
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      type: task?.type || 'own-task',
      priority: task?.priority || 'none',
      timeInvestment: task?.timeInvestment || 'low',
      category: task?.category || 'personal',
      scheduledDate: task?.scheduledDate || getCurrentDateInSaoPaulo(),
      assignedPersonId: task?.assignedPersonId || '',
      observations: task?.observations || '',
      order: task?.order || Math.max(...tasks.map(t => t.order || 0), 0) + 1,
      isRoutine: task?.isRoutine || false,
      routineCycle: task?.routineCycle,
      routineStartDate: task?.routineStartDate,
      routineEndDate: task?.routineEndDate,
      subItems: task?.subItems || [],
    },
  });

  const watchedScheduledDate = useWatch({ control: form.control, name: 'scheduledDate' });
  const watchedOrder = useWatch({ control: form.control, name: 'order' });

  // Obter tarefas do dia selecionado para validação de ordem
  const tasksForDate = tasks.filter(t => 
    t.scheduledDate === watchedScheduledDate && (!task || t.id !== task.id)
  );
  const maxOrderForDate = Math.max(...tasksForDate.map(t => t.order || 0), 0);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subItems',
  });

  const addSubItem = () => {
    append({
      id: crypto.randomUUID(),
      text: '',
      completed: false,
      order: fields.length + 1,
    });
  };

  const handleSubmit = (data: TaskFormValues) => {
    // Se a ordem foi alterada e é diferente da original, aplicar reordenamento
    if (task && task.order !== data.order) {
      console.log('Ordem alterada de', task.order, 'para', data.order);
      
      // Validar se a nova ordem está dentro do limite
      if (data.order < 1 || data.order > maxOrderForDate + 1) {
        form.setError('order', {
          message: `Ordem deve estar entre 1 e ${maxOrderForDate + 1}`
        });
        return;
      }
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informações da Tarefa</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="own-task">Tarefa Própria</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="delegated-task">Tarefa Delegada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Normal</SelectItem>
                      <SelectItem value="priority">Prioridade</SelectItem>
                      <SelectItem value="extreme">Extrema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baixo (5min)</SelectItem>
                      <SelectItem value="medium">Médio (1h)</SelectItem>
                      <SelectItem value="high">Alto (2h)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="business">Profissional</SelectItem>
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
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem (1 a {maxOrderForDate + 1})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={maxOrderForDate + 1}
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                  {watchedOrder && (watchedOrder < 1 || watchedOrder > maxOrderForDate + 1) && (
                    <p className="text-xs text-yellow-600">
                      Ao salvar, as outras tarefas serão reordenadas automaticamente.
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          {form.watch('type') === 'delegated-task' && (
            <FormField
              control={form.control}
              name="assignedPersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa Delegada</FormLabel>
                  <FormControl>
                    <PeopleSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecionar pessoa"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Checklist</h3>
            <Button type="button" onClick={addSubItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <FormField
                  control={form.control}
                  name={`subItems.${index}.completed`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subItems.${index}.text`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="Item do checklist" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {task ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
        </div>
      </form>
    </Form>
  );
}
