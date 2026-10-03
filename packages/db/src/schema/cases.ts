import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './iam.js';
import { hierarchyNodes, areas } from './geography.js';
import { people } from './people.js';
import { caseSubtypes } from './catalogue.js';

// ---------------------------------------------------------------------------
// Citizens (deduplicated by phone_hash per tenant)
// ---------------------------------------------------------------------------
export const citizens = pgTable(
  'citizens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    phone_enc: text('phone_enc'), // encrypted phone
    phone_hash: text('phone_hash'), // keyed hash for lookup
    name_enc: text('name_enc'), // encrypted name
    language: text('language').notNull().default('hi'),
    is_senior: boolean('is_senior').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('citizens_tenant_id_idx').on(table.tenant_id),
    index('citizens_tenant_phone_hash_idx').on(table.tenant_id, table.phone_hash),
  ],
);

// ---------------------------------------------------------------------------
// Cases (the core grievance/service-request/enquiry entity)
// ---------------------------------------------------------------------------
export const cases = pgTable(
  'cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    case_no: text('case_no').notNull(),
    kind: text('kind').notNull().default('complaint'),
    // complaint | service_request | enquiry | incident
    subtype_id: uuid('subtype_id')
      .references(() => caseSubtypes.id),
    status: text('status').notNull().default('REGISTERED'),
    // REGISTERED | ASSIGNED | ACCEPTED | IN_PROGRESS | ATR_SUBMITTED | ATR_REVIEW |
    // RESOLVED | CLOSED | ON_HOLD | EOT_PENDING | TRANSFER_PENDING | REOPENED |
    // REJECTED | NEEDS_CLASSIFICATION | MERGED
    node_id: uuid('node_id')
      .references(() => hierarchyNodes.id),
    node_path: text('node_path'), // denormalised ltree path for quick filtering
    area_id: uuid('area_id')
      .references(() => areas.id),
    address: text('address'),
    latitude: numeric('latitude'),
    longitude: numeric('longitude'),
    description: text('description'),
    citizen_id: uuid('citizen_id')
      .references(() => citizens.id),
    citizen_phone_hash: text('citizen_phone_hash'),
    citizen_name_enc: text('citizen_name_enc'),
    assignee_person_id: uuid('assignee_person_id')
      .references(() => people.id),
    vendor_id: uuid('vendor_id'), // FK to vendor table when added later
    priority: text('priority').notNull().default('normal'), // normal | high | emergency
    is_senior: boolean('is_senior').notNull().default(false),
    sla_due_at: timestamp('sla_due_at', { mode: 'date' }),
    accepted_at: timestamp('accepted_at', { mode: 'date' }),
    first_response_at: timestamp('first_response_at', { mode: 'date' }),
    resolved_at: timestamp('resolved_at', { mode: 'date' }),
    closed_at: timestamp('closed_at', { mode: 'date' }),
    breached: boolean('breached').notNull().default(false),
    reopen_count: integer('reopen_count').notNull().default(0),
    parent_case_id: uuid('parent_case_id'), // for merged/child cases
    channel: text('channel'), // voice_inbound | whatsapp | web | kiosk | mobile | walk_in | email
    source_ref: text('source_ref'), // external reference id
    config_version_id: uuid('config_version_id'), // snapshot of subtype config at registration
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('cases_tenant_id_idx').on(table.tenant_id),
    uniqueIndex('cases_tenant_case_no_idx').on(table.tenant_id, table.case_no),
    index('cases_tenant_status_idx').on(table.tenant_id, table.status),
    index('cases_tenant_subtype_idx').on(table.tenant_id, table.subtype_id),
    index('cases_tenant_node_idx').on(table.tenant_id, table.node_id),
    index('cases_tenant_assignee_idx').on(table.tenant_id, table.assignee_person_id),
    index('cases_tenant_citizen_idx').on(table.tenant_id, table.citizen_id),
    index('cases_tenant_sla_due_idx').on(table.tenant_id, table.sla_due_at),
    index('cases_tenant_created_idx').on(table.tenant_id, table.created_at),
    index('cases_citizen_phone_hash_idx').on(table.tenant_id, table.citizen_phone_hash),
    index('cases_parent_case_idx').on(table.tenant_id, table.parent_case_id),
  ],
);

// ---------------------------------------------------------------------------
// Case timeline (all state changes, notes, actions)
// ---------------------------------------------------------------------------
export const caseTimeline = pgTable(
  'case_timeline',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    action: text('action').notNull(),
    actor_id: uuid('actor_id'),
    actor_name: text('actor_name'),
    details: jsonb('details').notNull().default({}),
    is_public: boolean('is_public').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('case_timeline_tenant_case_idx').on(table.tenant_id, table.case_id),
    index('case_timeline_case_created_idx').on(table.case_id, table.created_at),
  ],
);

// ---------------------------------------------------------------------------
// Case attachments (photos, videos, audio, documents)
// ---------------------------------------------------------------------------
export const caseAttachments = pgTable(
  'case_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    kind: text('kind').notNull(), // photo | video | audio | document
    storage_key: text('storage_key').notNull(),
    filename: text('filename'),
    mime_type: text('mime_type'),
    size_bytes: integer('size_bytes'),
    metadata: jsonb('metadata').notNull().default({}), // exif, gps, phash
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('case_attachments_tenant_case_idx').on(table.tenant_id, table.case_id),
  ],
);

// ---------------------------------------------------------------------------
// Case requests (EOT, transfer, hold, reject, reopen)
// ---------------------------------------------------------------------------
export const caseRequests = pgTable(
  'case_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    request_type: text('request_type').notNull(), // eot | transfer | hold | reject | reopen
    status: text('status').notNull().default('pending'), // pending | approved | rejected
    requested_by: uuid('requested_by')
      .references(() => users.id),
    requested_at: timestamp('requested_at', { mode: 'date' }).notNull().defaultNow(),
    decided_by: uuid('decided_by')
      .references(() => users.id),
    decided_at: timestamp('decided_at', { mode: 'date' }),
    reason: text('reason'),
    details: jsonb('details').notNull().default({}),
  },
  (table) => [
    index('case_requests_tenant_case_idx').on(table.tenant_id, table.case_id),
    index('case_requests_tenant_status_idx').on(table.tenant_id, table.status),
  ],
);

// ---------------------------------------------------------------------------
// Feedback (citizen satisfaction)
// ---------------------------------------------------------------------------
export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    case_id: uuid('case_id')
      .notNull()
      .references(() => cases.id),
    rating: text('rating').notNull(), // positive | negative
    comment: text('comment'),
    channel: text('channel'), // voice | whatsapp | web | sms
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('feedback_tenant_case_idx').on(table.tenant_id, table.case_id),
  ],
);
