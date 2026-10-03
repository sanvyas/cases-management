import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './iam.js';
import { hierarchyNodes } from './geography.js';

// ---------------------------------------------------------------------------
// Settings values (platform, tenant, or node-level overrides)
// ---------------------------------------------------------------------------
export const settingsValues = pgTable(
  'settings_values',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .references(() => tenants.id), // nullable for platform-level settings
    node_id: uuid('node_id')
      .references(() => hierarchyNodes.id), // nullable; node-level override
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
    updated_by: uuid('updated_by')
      .references(() => users.id),
    updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('settings_values_tenant_key_idx').on(table.tenant_id, table.key),
    index('settings_values_tenant_node_key_idx').on(table.tenant_id, table.node_id, table.key),
  ],
);

// ---------------------------------------------------------------------------
// Audit log (immutable, append-only)
// ---------------------------------------------------------------------------
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .references(() => tenants.id),
    actor_id: uuid('actor_id'),
    actor_name: text('actor_name'),
    action: text('action').notNull(),
    entity_type: text('entity_type').notNull(),
    entity_id: text('entity_id').notNull(),
    before_value: jsonb('before_value'),
    after_value: jsonb('after_value'),
    ip_address: text('ip_address'),
    prev_hash: text('prev_hash'), // hash chain for tamper detection
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_log_tenant_idx').on(table.tenant_id),
    index('audit_log_tenant_entity_idx').on(table.tenant_id, table.entity_type, table.entity_id),
    index('audit_log_tenant_actor_idx').on(table.tenant_id, table.actor_id),
    index('audit_log_created_at_idx').on(table.tenant_id, table.created_at),
  ],
);

// ---------------------------------------------------------------------------
// Outbox events (transactional outbox pattern)
// ---------------------------------------------------------------------------
export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    event_type: text('event_type').notNull(),
    payload: jsonb('payload').notNull().default({}),
    status: text('status').notNull().default('pending'), // pending | processing | sent | failed
    retry_count: integer('retry_count').notNull().default(0),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    processed_at: timestamp('processed_at', { mode: 'date' }),
  },
  (table) => [
    index('outbox_events_status_idx').on(table.status, table.created_at),
    index('outbox_events_tenant_idx').on(table.tenant_id),
  ],
);

// ---------------------------------------------------------------------------
// Notification jobs (delivery tracking)
// ---------------------------------------------------------------------------
export const notificationJobs = pgTable(
  'notification_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    event_id: uuid('event_id')
      .references(() => outboxEvents.id),
    channel: text('channel').notNull(), // sms | whatsapp | email | push
    recipient_phone_hash: text('recipient_phone_hash'),
    recipient_email: text('recipient_email'),
    template_key: text('template_key').notNull(),
    variables: jsonb('variables').notNull().default({}),
    status: text('status').notNull().default('pending'), // pending | sent | failed | delivered
    provider_ref: text('provider_ref'),
    sent_at: timestamp('sent_at', { mode: 'date' }),
    delivered_at: timestamp('delivered_at', { mode: 'date' }),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('notification_jobs_tenant_idx').on(table.tenant_id),
    index('notification_jobs_status_idx').on(table.status, table.created_at),
    index('notification_jobs_event_idx').on(table.event_id),
  ],
);
