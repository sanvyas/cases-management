import { z } from 'zod';

export const AssignmentModeEnum = z.enum([
  'internal_auto', 'internal_manual', 'pool_manual',
  'field_auto', 'field_manual', 'vendor_auto', 'vendor_manual',
]);

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  status: z.enum(['active', 'inactive']),
});

export const CaseTypeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  icon: z.string(),
  displayOrder: z.number().int(),
  status: z.enum(['active', 'inactive']),
  subtypeCount: z.number().int().optional(),
});

export const CaseSubtypeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  typeId: z.string().uuid(),
  typeName: z.string(),
  departmentId: z.string().uuid(),
  departmentName: z.string(),
  name: z.string(),
  code: z.string(),
  slaHours: z.number().int(),
  assignmentMode: AssignmentModeEnum,
  priority: z.enum(['normal', 'high', 'emergency']),
  evidenceRequired: z.boolean(),
  minPhotos: z.number().int(),
  atrLevels: z.number().int(),
  eotLevels: z.number().int(),
  transferLevels: z.number().int(),
  status: z.enum(['active', 'inactive']),
});

export const CreateSubtypeSchema = z.object({
  typeId: z.string().uuid(),
  departmentId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  slaHours: z.number().int().min(1),
  assignmentMode: AssignmentModeEnum,
  priority: z.enum(['normal', 'high', 'emergency']).default('normal'),
  evidenceRequired: z.boolean().default(true),
  minPhotos: z.number().int().default(1),
  atrLevels: z.number().int().default(1),
  eotLevels: z.number().int().default(1),
  transferLevels: z.number().int().default(1),
});

export type AssignmentMode = z.infer<typeof AssignmentModeEnum>;
export type Department = z.infer<typeof DepartmentSchema>;
export type CaseType = z.infer<typeof CaseTypeSchema>;
export type CaseSubtype = z.infer<typeof CaseSubtypeSchema>;
export type CreateSubtype = z.infer<typeof CreateSubtypeSchema>;
