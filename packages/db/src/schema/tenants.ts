import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  modules: text('modules').array().notNull().default([]),
  limits: jsonb('limits').notNull().default({}),
  created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: text('status').notNull().default('active'), // active | suspended | offboarded
    plan_id: uuid('plan_id').references(() => plans.id),
    timezone: text('timezone').notNull().default('Asia/Kolkata'),
    default_language: text('default_language').notNull().default('hi'),
    enabled_languages: text('enabled_languages').array().notNull().default(['hi', 'en']),
    branding: jsonb('branding').notNull().default({}),
    settings: jsonb('settings').notNull().default({}),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('tenants_slug_idx').on(table.slug),
  ],
);
