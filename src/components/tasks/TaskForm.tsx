import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import { cn, formatDate } from "@/lib/utils";
import { taskFormSchema } from "@/lib/validations/task";
import { TaskFormValues, Task, Person, SubItem } from "@/types";
import { usePeople } from "@/hooks/usePeople";
import { useToast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Label } from "@/components/ui/label";
import { InteractiveSubItemList } from "./InteractiveSubItemList";

interface TaskFormProps {
  task?: Task;
  onSubmit: (values: TaskFormValues & { subItems: SubItem[] }) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [subItems, setSubItems] = useState<SubItem[]>(task?.subItems || []);
  const { people, loading: loadingPeople, refetch: refetchPeople } = usePeople();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      type: task?.type || "own-task",
      priority: task?.priority || "none",
      timeInvestment: task?.timeInvestment || "low",
      customTimeMinutes: task?.customTimeMinutes || undefined,
      category: task?.category || "personal",
      assignedPersonId: task?.assignedPersonId || "",
      scheduledDate: task?.scheduledDate || formatDate(new Date()),
      order: task?.order || 0,
      observations: task?.observations || "",
      isRoutine: task?.isRoutine || false,
      routineCycle: task?.routineCycle || undefined,
      routineStartDate: task?.routineStartDate || undefined,
      routineEndDate: task?.routineEndDate || undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        type: task.type,
        priority: task.priority,
        timeInvestment: task.timeInvestment,
        customTimeMinutes: task.customTimeMinutes || undefined,
        category: task.category,
        assignedPersonId: task.assignedPersonId || "",
        scheduledDate: task.scheduledDate,
        order: task.order || 0,
        observations: task.observations || "",
        isRoutine: task.isRoutine || false,
        routineCycle: task.routineCycle || undefined,
        routineStartDate: task.routineStartDate || undefined,
        routineEndDate: task.routineEndDate || undefined,
      });
      setSubItems(task.subItems || []);
    }
  }, [task, form]);

  const handleSave = async (values: TaskFormValues) => {
    setIsSaving(true);
    try {
      await onSubmit({ ...values, subItems });
      toast({
        title: "Sucesso",
        description: "Tarefa salva com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const assignedPersonOptions = () => {
    if (!people) return null;

    return people.map((person) => ({
      label: person.name,
      value: person.id,
    }));
  };

  const timeInvestmentOptions = [
    { label: '5 minutos', value: 'custom-5' },
    { label: '30 minutos', value: 'custom-30' },
    { label: 'Baixo (1h)', value: 'low' },
    { label: 'Médio (2h)', value: 'medium' },
    { label: 'Alto (4h)', value: 'high' },
    { label: '4 horas', value: 'custom-4h' },
    { label: '8 horas', value: 'custom-8h' },
    { label: 'Personalizado', value: 'custom' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da tarefa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(new Date(field.value))
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(formatDate(date))}
                      disabled={(date) =>
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Textarea
                  placeholder="Detalhes da tarefa"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="own-task">Tarefa Própria</SelectItem>
                    <SelectItem value="delegated-task">Tarefa Delegada</SelectItem>
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
                    <SelectItem value="none">Nenhuma</SelectItem>
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
                <FormLabel>Tempo Estimado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tempo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeInvestmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.getValues("timeInvestment") === 'custom' && (
          <FormField
            control={form.control}
            name="customTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo Personalizado (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Tempo em minutos"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(isNaN(value) ? undefined : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="business">Negócios</SelectItem>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingPeople}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir a uma pessoa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Ninguém</SelectItem>
                    {people && people.length > 0 ? (
                      assignedPersonOptions()?.map((person) => (
                        <SelectItem key={person.value} value={person.value}>
                          {person.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Nenhuma pessoa cadastrada
                      </SelectItem>
                    )}
                    <SelectItem value="new" className="text-blue-500">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => {
                          navigate('/pessoas/novo');
                        }}
                      >
                        Nova Pessoa
                      </Button>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Anotações adicionais"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checklist */}
        <InteractiveSubItemList
          subItems={subItems}
          onSubItemsChange={setSubItems}
        />

        <FormField
          control={form.control}
          name="isRoutine"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Tarefa Rotineira?</FormLabel>
                <FormDescription>
                  Marque se esta tarefa se repete regularmente.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {form.getValues("isRoutine") && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="routineCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclo da Rotina</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ciclo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="biannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routineStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início da Rotina</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(new Date(field.value))
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(formatDate(date))}
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

            <FormField
              control={form.control}
              name="routineEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Término da Rotina</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(new Date(field.value))
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(formatDate(date))}
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
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
