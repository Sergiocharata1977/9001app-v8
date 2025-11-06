import { z } from 'zod';

// Impact Assessment Schema
export const impactAssessmentSchema = z.object({
  customerImpact: z.boolean(),
  regulatoryImpact: z.boolean(),
  financialImpact: z.boolean(),
  operationalImpact: z.boolean(),
  description: z.string().optional(),
});

// Immediate Correction Schema
export const immediateCorrectionSchema = z.object({
  description: z.string().min(1, 'Correction description is required'),
  status: z.enum(['pending', 'in_progress', 'completed']),
  commitmentDate: z.string().optional(),
  closureDate: z.string().optional(),
});

// Root Cause Analysis Schema
export const rootCauseAnalysisSchema = z.object({
  method: z.string().min(1, 'Analysis method is required'),
  rootCause: z.string().min(1, 'Root cause is required'),
  contributingFactors: z.array(z.string()).optional(),
  analysis: z.string().min(1, 'Analysis description is required'),
});

// Finding Form Data Schema
export const findingFormDataSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  source: z.enum(['audit', 'employee', 'customer', 'inspection', 'supplier']),
  sourceId: z.string().optional(),
  sourceName: z.string().optional(),
  sourceReference: z.string().optional(),
  findingType: z.enum([
    'non_conformity',
    'observation',
    'improvement_opportunity',
  ]),
  severity: z.enum(['critical', 'major', 'minor', 'low']),
  category: z.enum([
    'quality',
    'safety',
    'environment',
    'process',
    'equipment',
    'documentation',
  ]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  processId: z.string().optional(),
  location: z.string().optional(),
  evidence: z.string().min(1, 'Evidence is required'),
  evidenceDocuments: z.array(z.string()).optional(),
  responsiblePersonId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  targetCloseDate: z.string().optional(),
  consequence: z.string().optional(),
  impactAssessment: impactAssessmentSchema.optional(),
});

// Finding Update Schema (partial)
export const findingUpdateSchema = findingFormDataSchema.partial();

// Finding Status Update Schema
export const findingStatusUpdateSchema = z.object({
  status: z.enum([
    'open',
    'in_analysis',
    'action_planned',
    'in_progress',
    'closed',
  ]),
  userId: z.string().min(1, 'User ID is required'),
});

// Finding Phase Update Schema
export const findingPhaseUpdateSchema = z.object({
  phase: z.enum(['detection', 'treatment', 'control']),
});

// Verification Data Schema
export const verificationDataSchema = z.object({
  verifiedBy: z.string().min(1, 'Verifier ID is required'),
  verificationDate: z.string().min(1, 'Verification date is required'),
  verificationEvidence: z.string().min(1, 'Verification evidence is required'),
  verificationComments: z.string().optional(),
});

// Finding Filters Schema
export const findingFiltersSchema = z.object({
  source: z.string().optional(),
  status: z.string().optional(),
  severity: z.string().optional(),
  findingType: z.string().optional(),
  category: z.string().optional(),
  responsiblePersonId: z.string().optional(),
  year: z.number().optional(),
  search: z.string().optional(),
});
