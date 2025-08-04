import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, dateToLocalString, stringToLocalDate } from "@/lib/utils";
import { Task, TaskType, TaskPriority, SubItem } from "@/types";
import { usePeople } from "@/hooks/usePeople";

const taskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["meeting", "own-task", "delegated-task"]),
  priority: z.enum(["simple", "urgent", "complex"]),
  assignedPersonId: z.string().optional(),
  scheduledDate: z.string(),
  observations: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormValues & { subItems: SubItem[] }) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { people } = usePeople();
  const [subItems, setSubItems] = useState<SubItem[]>(task?.subItems || []);
  const [newSubItem, setNewSubItem] = useState("");

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: task?.type || "own-task",
      priority: task?.priority || "simple",
      assignedPersonId: task?.assignedPersonId || "",
      scheduledDate: task?.scheduledDate || new Date().toISOString().split('T')[0],
      observations: task?.observations || "",
    },
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit({ ...data, subItems });
  };

  const addSubItem = () => {
    if (newSubItem.trim()) {
      const subItem: SubItem = {
        id: crypto.randomUUID(),
        text: newSubItem.trim(),
        completed: false,
        order: subItems.length,
      };
      setSubItems([...subItems, subItem]);
      setNewSubItem("");
    }
  };

  const removeSubItem = (id: string) => {
    setSubItems(subItems.filter(item => item.id !== id));
  };

  const toggleSubItem = (id: string) => {
    setSubItems(subItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const typeOptions = [
    { value: "meeting", label: "Reunião" },
    { value: "own-task", label: "Tarefa Própria" },
    { value: "delegated-task", label: "Tarefa Delegada" },
  ];

  const priorityOptions = [
    { value: "simple", label: "Simples" },
    { value: "urgent", label: "Urgente" },
    { value: "complex", label: "Complexa" },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
        <CardDescription>
          Preencha os detalhes da tarefa para organizar seu dia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título */}
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

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes da tarefa" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo e Prioridade */}
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
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pessoa Responsável (se for tarefa repassada) */}
            {form.watch("type") === "delegated-task" && (
              <FormField
                control={form.control}
                name="assignedPersonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a equipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} - {person.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Data */}
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Programada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? stringToLocalDate(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(dateToLocalString(date));
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subitens */}
            <div className="space-y-4">
              <FormLabel>Subitens (Checklist)</FormLabel>
              
              {/* Lista de subitens */}
              <div className="space-y-2">
                {subItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleSubItem(item.id)}
                      className="h-4 w-4"
                    />
                    <span className={cn("flex-1", item.completed && "line-through text-muted-foreground")}>
                      {item.text}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Adicionar novo subitem */}
              <div className="flex gap-2">
                <Input
                  placeholder="Novo subitem..."
                  value={newSubItem}
                  onChange={(e) => setNewSubItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubItem()}
                />
                <Button type="button" onClick={addSubItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
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
                    <Textarea 
                      placeholder="Observações adicionais..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {task ? "Atualizar" : "Criar"} Tarefa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}