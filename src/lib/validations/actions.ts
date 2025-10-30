import { z } from 'zod';

// Team Member Schema
export const teamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().min(1, 'User name is required'),
  role: z.string().min(1, 'Role is required'),
});

// Action Plan Step Schema
export const actionPlanStepSchema = z.object({
  sequence: z.number().positive(),
  description: z.string().min(1, 'Step description is required'),
  responsible: z.string().min(1, 'Responsible person is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  status: z.enum(['pending', 'in_progress', 'completed']),
  evidence: z.string().optional(),
});

// Action Plan Schema
export const actionPlanSchema = z.object({
  steps: z.array(actionPlanStepSchema).min(1, 'At least one step is required'),
});

// Required Resources Schema
export const requiredResourcesSchema = z.object({
  budget: z.number().positive().optional(),
  equipment: z.array(z.string()).optional(),
  personnel: z.array(z.string()).optional(),
  time: z.number().positive().optional(),
});

// Effectiveness Verification Schema
export const effectivenessVerificationSchema = z.object({
  responsiblePersonId: z.string().min(1, 'Responsible person ID is required'),
  responsiblePersonName: z
    .string()
    .min(1, 'Responsible person name is required'),
  verificationCommitmentDate: z.string().optional(),
  verificationExecutionDate: z.string().optional(),
  method: z.string().min(1, 'Verification method is required'),
  criteria: z.string().min(1, 'Effectiveness criteria is required'),
  isEffective: z.boolean(),
  result: z.string().min(1, 'Verification result is required'),
  evidence: z.string().min(1, 'Verification evidence is required'),
  comments: z.string().optional(),
});

// Action Form Data Schema
export const actionFormDataSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
    description: z.string().min(1, 'Description is required'),
    actionType: z.enum(['corrective', 'preventive', 'improvement']),
    sourceType: z.enum(['audit', 'employee', 'customer', 'finding']),
    sourceId: z.string().min(1, 'Source ID is required'),
    findingId: z.string().min(1, 'Finding ID is required'),
    findingNumber: z.string().min(1, 'Finding number is required'),
    plannedStartDate: z.string().min(1, 'Planned start date is required'),
    plannedEndDate: z.string().min(1, 'Planned end date is required'),
    responsiblePersonId: z.string().min(1, 'Responsible person is required'),
    responsiblePersonName: z
      .string()
      .min(1, 'Responsible person name is required'),
    teamMembers: z.array(teamMemberSchema).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    actionPlan: actionPlanSchema.optional(),
    requiredResources: requiredResourcesSchema.optional(),
    documents: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      // Validate that plannedEndDate is after plannedStartDate
      const start = new Date(data.plannedStartDate);
      const end = new Date(data.plannedEndDate);
      return end > start;
    },
    {
      message: 'Planned end date must be after planned start date',
      path: ['plannedEndDate'],
    }
  );

// Action Update Schema (partial)
export const actionUpdateSchema = actionFormDataSchema.partial();

// Action Status Update Schema
export const actionStatusUpdateSchema = z.object({
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold',
  ]),
  userId: z.string().min(1, 'User ID is required'),
});

// Action Progress Update Schema
export const actionProgressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
});

// Action Phase Update Schema
export const actionPhaseUpdateSchema = z.object({
  phase: z.enum(['treatment', 'control']),
});

// Comment Data Schema
export const commentDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().min(1, 'User name is required'),
  comment: z.string().min(1, 'Comment is required'),
});

// Action Filters Schema
export const actionFiltersSchema = z.object({
  status: z.string().optional(),
  actionType: z.string().optional(),
  priority: z.string().optional(),
  sourceType: z.string().optional(),
  responsiblePersonId: z.string().optional(),
  findingId: z.string().optional(),
  year: z.number().optional(),
  search: z.string().optional(),
});
