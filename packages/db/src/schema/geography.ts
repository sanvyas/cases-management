import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

// ---------------------------------------------------------------------------
// Hierarchy levels (tenant-configurable depth tree)
// ---------------------------------------------------------------------------
export const hierarchyLevels = pgTable(
  'hierarchy_levels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    depth: integer('depth').notNull(),
    parent_level_id: uuid('parent_level_id'),
  },
  (table) => [
    index('hierarchy_levels_tenant_id_idx').on(table.tenant_id),
    index('hierarchy_levels_tenant_depth_idx').on(table.tenant_id, table.depth),
  ],
);

// ---------------------------------------------------------------------------
// Hierarchy nodes (wards, zones, blocks, villages, etc.)
// ---------------------------------------------------------------------------
export const hierarchyNodes = pgTable(
  'hierarchy_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    level_id: uuid('level_id')
      .notNull()
      .references(() => hierarchyLevels.id),
    parent_id: uuid('parent_id'), // self-referencing, nullable for root
    path: text('path').notNull(), // ltree-style materialized path
    status: text('status').notNull().default('active'), // active | inactive
    lgd_code: text('lgd_code'), // Local Government Directory code
    metadata: jsonb('metadata').notNull().default({}),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('hierarchy_nodes_tenant_id_idx').on(table.tenant_id),
    index('hierarchy_nodes_tenant_parent_idx').on(table.tenant_id, table.parent_id),
    index('hierarchy_nodes_tenant_level_idx').on(table.tenant_id, table.level_id),
    uniqueIndex('hierarchy_nodes_tenant_slug_idx').on(table.tenant_id, table.slug),
    index('hierarchy_nodes_path_idx').on(table.tenant_id, table.path),
  ],
);

// ---------------------------------------------------------------------------
// Areas (named regions with optional GeoJSON boundary)
// ---------------------------------------------------------------------------
export const areas = pgTable(
  'areas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    node_id: uuid('node_id')
      .notNull()
      .references(() => hierarchyNodes.id),
    boundary: jsonb('boundary'), // GeoJSON polygon
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('areas_tenant_id_idx').on(table.tenant_id),
    index('areas_tenant_node_idx').on(table.tenant_id, table.node_id),
  ],
);
