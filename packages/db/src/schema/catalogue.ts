import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { designations } from './people.js';

// ---------------------------------------------------------------------------
// Case types (top-level category: Water, Roads, Sanitation, etc.)
// ---------------------------------------------------------------------------
export const caseTypes = pgTable(
  'case_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    icon: text('icon'),
    display_order: integer('display_order').notNull().default(0),
    status: text('status').notNull().default('active'), // active | inactive
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('case_types_tenant_id_idx').on(table.tenant_id),
    index('case_types_tenant_order_idx').on(table.tenant_id, table.display_order),
  ],
);

// ---------------------------------------------------------------------------
// Case subtypes (specific complaint/service type with SLA and workflow config)
// ---------------------------------------------------------------------------
export const caseSubtypes = pgTable(
  'case_subtypes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    type_id: uuid('type_id')
      .notNull()
      .references(() => caseTypes.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    sla_hours: integer('sla_hours').notNull().default(48),
    assignment_mode: text('assignment_mode').notNull().default('internal_auto'),
    // internal_auto | internal_manual | pool_manual | field_auto | field_manual | vendor_auto | vendor_manual
    priority: text('priority').notNull().default('normal'), // normal | high | emergency
    evidence_required: boolean('evidence_required').notNull().default(false),
    min_photos: integer('min_photos').notNull().default(0),
    atr_levels: integer('atr_levels').notNull().default(1),
    eot_levels: integer('eot_levels').notNull().default(1),
    transfer_levels: integer('transfer_levels').notNull().default(1),
    status: text('status').notNull().default('active'), // active | inactive
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('case_subtypes_tenant_id_idx').on(table.tenant_id),
    index('case_subtypes_tenant_type_idx').on(table.tenant_id, table.type_id),
    uniqueIndex('case_subtypes_tenant_code_idx').on(table.tenant_id, table.code),
  ],
);

// ---------------------------------------------------------------------------
// Escalation rules (SLA-breach escalation ladder per subtype)
// ---------------------------------------------------------------------------
export const escalationRules = pgTable(
  'escalation_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    subtype_id: uuid('subtype_id')
      .notNull()
      .references(() => caseSubtypes.id),
    level: integer('level').notNull(),
    escalate_to_designation_id: uuid('escalate_to_designation_id')
      .notNull()
      .references(() => designations.id),
    trigger_basis: text('trigger_basis').notNull(), // pct_of_sla | after_sla | from_registration
    trigger_value: integer('trigger_value').notNull(), // minutes or percentage
    notify_only: boolean('notify_only').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('escalation_rules_tenant_id_idx').on(table.tenant_id),
    index('escalation_rules_tenant_subtype_idx').on(table.tenant_id, table.subtype_id),
    index('escalation_rules_subtype_level_idx').on(table.subtype_id, table.level),
  ],
);
