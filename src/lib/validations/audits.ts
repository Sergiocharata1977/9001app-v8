import { z } from 'zod';

export const AuditFormSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .default(''),
  plannedDate: z.date(),
  leadAuditor: z.string().min(1, 'El auditor líder es requerido'),
});

export const AuditExecutionSchema = z.object({
  processes: z.array(z.string()).default([]),
  normPointCodes: z.array(z.string()).default([]),
  findings: z
    .string()
    .max(2000, 'Los hallazgos no pueden exceder 2000 caracteres')
    .optional()
    .default(''),
});

export const AuditStatusSchema = z.enum([
  'planned',
  'in_progress',
  'completed',
]);

export type AuditFormInput = z.infer<typeof AuditFormSchema>;
export type AuditExecutionInput = z.infer<typeof AuditExecutionSchema>;
