import { z } from 'zod';

export const HierarchyLevelSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  depth: z.number().int(),
  parentLevelId: z.string().uuid().nullable(),
});

export const HierarchyNodeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  levelId: z.string().uuid(),
  levelName: z.string(),
  parentId: z.string().uuid().nullable(),
  path: z.string(),
  status: z.enum(['active', 'inactive']),
  lgdCode: z.string().nullable(),
  childCount: z.number().int().optional(),
});

export const CreateNodeSchema = z.object({
  name: z.string().min(1),
  levelId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  lgdCode: z.string().optional(),
});

export const AreaSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  nodeId: z.string().uuid(),
  nodeName: z.string(),
});

export type HierarchyLevel = z.infer<typeof HierarchyLevelSchema>;
export type HierarchyNode = z.infer<typeof HierarchyNodeSchema>;
export type CreateNode = z.infer<typeof CreateNodeSchema>;
export type Area = z.infer<typeof AreaSchema>;
