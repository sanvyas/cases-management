import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './iam.js';
import { hierarchyNodes } from './geography.js';

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const departments = pgTable(
  'departments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    status: text('status').notNull().default('active'), // active | inactive
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('departments_tenant_id_idx').on(table.tenant_id),
    index('departments_tenant_code_idx').on(table.tenant_id, table.code),
  ],
);

// ---------------------------------------------------------------------------
// Designations
// ---------------------------------------------------------------------------
export const designations = pgTable(
  'designations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    level: integer('level').notNull(),
    parent_id: uuid('parent_id'), // self-referencing
    department_id: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('designations_tenant_id_idx').on(table.tenant_id),
    index('designations_tenant_dept_idx').on(table.tenant_id, table.department_id),
  ],
);

// ---------------------------------------------------------------------------
// People (an officer/staff member in a tenant org)
// ---------------------------------------------------------------------------
export const people = pgTable(
  'people',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id),
    designation_id: uuid('designation_id')
      .notNull()
      .references(() => designations.id),
    department_id: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    status: text('status').notNull().default('active'), // active | inactive | transferred
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('people_tenant_id_idx').on(table.tenant_id),
    index('people_tenant_user_idx').on(table.tenant_id, table.user_id),
    index('people_tenant_dept_idx').on(table.tenant_id, table.department_id),
    index('people_tenant_designation_idx').on(table.tenant_id, table.designation_id),
  ],
);

// ---------------------------------------------------------------------------
// Charges (assignment of a person to a geography node)
// ---------------------------------------------------------------------------
export const charges = pgTable(
  'charges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    person_id: uuid('person_id')
      .notNull()
      .references(() => people.id),
    node_id: uuid('node_id')
      .notNull()
      .references(() => hierarchyNodes.id),
    designation_id: uuid('designation_id')
      .notNull()
      .references(() => designations.id),
    department_id: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    is_temporary: boolean('is_temporary').notNull().default(false),
    valid_from: timestamp('valid_from', { mode: 'date' }).notNull().defaultNow(),
    valid_to: timestamp('valid_to', { mode: 'date' }),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('charges_tenant_id_idx').on(table.tenant_id),
    index('charges_tenant_person_idx').on(table.tenant_id, table.person_id),
    index('charges_tenant_node_idx').on(table.tenant_id, table.node_id),
    index('charges_tenant_designation_idx').on(table.tenant_id, table.designation_id),
  ],
);
