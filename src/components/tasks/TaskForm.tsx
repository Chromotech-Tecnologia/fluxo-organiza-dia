
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, AlertTriangle, Users, Tag, FileText } from "lucide-react";
import { TaskFormValues, TaskType, TaskPriority, TaskTimeInvestment, TaskCategory } from "@/types";
import { taskFormSchema } from "@/lib/validations/task";
import { InteractiveSubItemList } from "./InteractiveSubItemList";
import { PeopleSelect } from "../people/PeopleSelect";

interface TaskFormProps {
  onSubmit: (data: TaskFormValues) => void;
  initialData?: Partial<TaskFormValues>;
  isLoading?: boolean;
}

const typeOptions: { value: TaskType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'own-task', label: 'Tarefa Própria', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'meeting', label: 'Reunião', icon: <Users className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
  { value: 'delegated-task', label: 'Tarefa Delegada', icon: <Users className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'none', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'priority', label: 'Prioridade', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'extreme', label: 'Extrema', color: 'bg-red-100 text-red-800' },
];

const timeInvestmentOptions: { value: TaskTimeInvestment; label: string }[] = [
  { value: 'low', label: '5 minutos' },
  { value: 'medium', label: '1 hora' },
  { value: 'high', label: '2 horas' },
  { value: 'custom-4h', label: '4 horas' },
  { value: 'custom-8h', label: '8 horas' },
  { value: 'custom', label: 'Personalizado' },
];

const categoryOptions: { value: TaskCategory; label: string }[] = [
  { value: 'personal', label: 'Pessoal' },
  { value: 'business', label: 'Profissional' },
];

const routineCycleOptions = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

export function TaskForm({ onSubmit, initialData, isLoading }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'own-task',
      priority: 'none',
      timeInvestment: 'low',
      category: 'business',
      scheduledDate: new Date().toISOString().split('T')[0],
      order: 1,
      observations: '',
      isRoutine: false,
      subItems: [],
      ...initialData,
    },
  });

  const watchedType = form.watch('type');
  const watchedTimeInvestment = form.watch('timeInvestment');
  const watchedIsRoutine = form.watch('isRoutine');
  const watchedSubItems = form.watch('subItems');

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: '',
        description: '',
        type: 'own-task',
        priority: 'none',
        timeInvestment: 'low',
        category: 'business',
        scheduledDate: new Date().toISOString().split('T')[0],
        order: 1,
        observations: '',
        isRoutine: false,
        subItems: [],
        ...initialData,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
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
                      placeholder="Descreva os detalhes da tarefa"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Data Agendada *
                    </FormLabel>
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
                    <FormLabel>Ordem de Execução</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Classificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Tarefa *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Prioridade
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
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

            <FormField
              control={form.control}
              name="timeInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Tempo de Investimento *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeInvestmentOptions.map((option) => (
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

            {watchedTimeInvestment === 'custom' && (
              <FormField
                control={form.control}
                name="customTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Personalizado (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Ex: 45"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Delegação */}
        {watchedType === 'delegated-task' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Delegação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="assignedPersonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa Responsável *</FormLabel>
                    <FormControl>
                      <PeopleSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione a pessoa responsável"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Checklist */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="subItems"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InteractiveSubItemList 
                      subItems={field.value}
                      onSubItemsChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Rotina */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Rotina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isRoutine"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tarefa de Rotina</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Esta tarefa se repete em intervalos regulares
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchedIsRoutine && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="routineCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciclo da Rotina</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o ciclo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routineCycleOptions.map((option) => (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="routineStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início da Rotina</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routineEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fim da Rotina (opcional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione observações, links, ou informações complementares"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Salvando...' : (initialData?.title ? 'Atualizar Tarefa' : 'Criar Tarefa')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
