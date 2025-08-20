
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(['meeting', 'own-task', 'delegated-task']),
  priority: z.enum(['none', 'priority', 'extreme']),
  timeInvestment: z.enum(['low', 'medium', 'high']),
  category: z.enum(['personal', 'business']),
  assignedPersonId: z.string().optional(),
  scheduledDate: z.string(),
  order: z.number().default(0),
  observations: z.string().optional(),
  isRoutine: z.boolean().default(false),
  routineCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
  routineStartDate: z.string().optional(),
  routineEndDate: z.string().optional(),
});
