import { z } from 'zod';

export const CaseStatusEnum = z.enum([
  'REGISTERED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS',
  'ATR_SUBMITTED', 'ATR_REVIEW', 'RESOLVED', 'CLOSED',
  'ON_HOLD', 'EOT_PENDING', 'TRANSFER_PENDING',
  'REOPENED', 'REJECTED', 'NEEDS_CLASSIFICATION', 'MERGED',
]);

export const CaseKindEnum = z.enum(['complaint', 'service_request', 'enquiry', 'incident']);
export const CasePriorityEnum = z.enum(['normal', 'high', 'emergency']);

export const CreateCaseSchema = z.object({
  subtypeId: z.string().uuid(),
  nodeId: z.string().uuid(),
  areaId: z.string().uuid().optional(),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().min(1),
  citizenPhone: z.string().min(10),
  citizenName: z.string().min(1),
  isSenior: z.boolean().optional(),
  channel: z.string().default('web'),
  sourceRef: z.string().optional(),
});

export const CaseResponseSchema = z.object({
  id: z.string().uuid(),
  caseNo: z.string(),
  kind: CaseKindEnum,
  status: CaseStatusEnum,
  subtypeId: z.string().uuid(),
  subtypeName: z.string(),
  departmentName: z.string(),
  typeName: z.string(),
  nodeId: z.string().uuid(),
  nodeName: z.string(),
  nodePath: z.string(),
  address: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  description: z.string(),
  citizenName: z.string(),
  citizenPhone: z.string(),
  assigneeName: z.string().nullable(),
  assigneeDesignation: z.string().nullable(),
  priority: CasePriorityEnum,
  isSenior: z.boolean(),
  slaDueAt: z.string().datetime().nullable(),
  breached: z.boolean(),
  reopenCount: z.number(),
  channel: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CaseListQuerySchema = z.object({
  status: CaseStatusEnum.optional(),
  departmentId: z.string().uuid().optional(),
  subtypeId: z.string().uuid().optional(),
  nodeId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const CaseActionSchema = z.object({
  action: z.enum([
    'assign', 'accept', 'start_work', 'submit_atr', 'approve_atr',
    'return_atr', 'resolve', 'close', 'request_eot', 'approve_eot',
    'reject_eot', 'request_transfer', 'approve_transfer', 'reject_transfer',
    'request_hold', 'release_hold', 'reject_case', 'reopen',
    'feedback_positive', 'feedback_negative',
  ]),
  remarks: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  reason: z.string().optional(),
});

export const TimelineEntrySchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  actorName: z.string(),
  details: z.record(z.unknown()).nullable(),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
});

export const FeedbackSchema = z.object({
  rating: z.enum(['positive', 'negative']),
  comment: z.string().optional(),
  channel: z.string().default('web'),
});

export type CaseStatus = z.infer<typeof CaseStatusEnum>;
export type CaseKind = z.infer<typeof CaseKindEnum>;
export type CasePriority = z.infer<typeof CasePriorityEnum>;
export type CreateCase = z.infer<typeof CreateCaseSchema>;
export type CaseResponse = z.infer<typeof CaseResponseSchema>;
export type CaseListQuery = z.infer<typeof CaseListQuerySchema>;
export type CaseAction = z.infer<typeof CaseActionSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
