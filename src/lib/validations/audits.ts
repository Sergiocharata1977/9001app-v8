import { z } from 'zod';

// Audit Team Member Schema
export const auditTeamMemberSchema = z.object({
  auditorId: z.string().min(1, 'Auditor ID is required'),
  auditorName: z.string().min(1, 'Auditor name is required'),
  role: z.enum(['lead', 'assistant', 'observer']),
});

// Audit Form Data Schema
export const auditFormDataSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
    description: z.string().optional(),
    auditType: z.enum(['internal', 'external', 'supplier', 'customer']),
    auditScope: z.enum(['full', 'partial', 'follow_up']),
    isoClausesCovered: z.array(z.string()).optional(),
    plannedDate: z.string().min(1, 'Planned date is required'),
    duration: z.number().positive().optional(),
    leadAuditorId: z.string().min(1, 'Lead auditor is required'),
    leadAuditorName: z.string().min(1, 'Lead auditor name is required'),
    auditTeam: z.array(auditTeamMemberSchema).optional(),
    followUpRequired: z.boolean().optional(),
    followUpDate: z.string().optional(),
    correctionDeadline: z.string().optional(),
  })
  .refine(
    data => {
      // If followUpRequired is true, followUpDate must be provided
      if (data.followUpRequired && !data.followUpDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Follow-up date is required when follow-up is required',
      path: ['followUpDate'],
    }
  );

// Audit Update Schema (partial)
export const auditUpdateSchema = auditFormDataSchema.partial();

// Audit Status Update Schema
export const auditStatusUpdateSchema = z.object({
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'postponed',
  ]),
  userId: z.string().min(1, 'User ID is required'),
});

// Audit Filters Schema
export const auditFiltersSchema = z.object({
  status: z.string().optional(),
  auditType: z.string().optional(),
  year: z.number().optional(),
  leadAuditorId: z.string().optional(),
  search: z.string().optional(),
});

// ISO Clause validation helper
export const isoClausePattern = /^\d+(\.\d+)*$/;

export function validateIsoClause(clause: string): boolean {
  return isoClausePattern.test(clause);
}
