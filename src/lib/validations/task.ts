
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(['meeting', 'own-task', 'delegated-task']),
  priority: z.enum(['none', 'priority', 'extreme']),
  timeInvestment: z.enum(['custom-5', 'custom-30', 'low', 'medium', 'high', 'custom-4h', 'custom-8h', 'custom']),
  customTimeMinutes: z.number().min(1, "Tempo personalizado deve ser maior que 0").optional(),
  category: z.enum(['personal', 'business']),
  assignedPersonId: z.string().optional(),
  scheduledDate: z.string(),
  order: z.number().default(0),
  observations: z.string().optional(),
  isRoutine: z.boolean().default(false),
  routineCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
  routineStartDate: z.string().optional(),
  routineEndDate: z.string().optional(),
}).refine((data) => {
  // Se timeInvestment for 'custom', customTimeMinutes é obrigatório
  if (data.timeInvestment === 'custom' && !data.customTimeMinutes) {
    return false;
  }
  return true;
}, {
  message: "Tempo personalizado é obrigatório quando selecionado",
  path: ["customTimeMinutes"],
});
