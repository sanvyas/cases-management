import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    phone_enc: text('phone_enc'), // encrypted phone number
    phone_hash: text('phone_hash'), // keyed hash for lookup
    email: text('email'),
    name: text('name').notNull(),
    status: text('status').notNull().default('active'), // active | suspended | locked
    language: text('language').notNull().default('hi'),
    is_platform_user: boolean('is_platform_user').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('users_tenant_id_idx').on(table.tenant_id),
    index('users_phone_hash_idx').on(table.tenant_id, table.phone_hash),
    index('users_email_idx').on(table.tenant_id, table.email),
  ],
);

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    device_info: jsonb('device_info'),
    refresh_token_hash: text('refresh_token_hash'),
    expires_at: timestamp('expires_at', { mode: 'date' }).notNull(),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.tenant_id, table.user_id),
    index('sessions_expires_at_idx').on(table.expires_at),
  ],
);

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------
export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    description: text('description'),
    module_key: text('module_key'),
  },
  (table) => [
    uniqueIndex('permissions_code_idx').on(table.code),
  ],
);

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenant_id: uuid('tenant_id').references(() => tenants.id), // nullable for system roles
    name: text('name').notNull(),
    is_system: boolean('is_system').notNull().default(false),
    is_custom: boolean('is_custom').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('roles_tenant_id_idx').on(table.tenant_id),
  ],
);

// ---------------------------------------------------------------------------
// Role-Permission mapping (composite PK)
// ---------------------------------------------------------------------------
export const rolePermissions = pgTable(
  'role_permissions',
  {
    role_id: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission_id: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.role_id, table.permission_id] }),
  ],
);

// ---------------------------------------------------------------------------
// Role grants (user-role assignment with scope)
// ---------------------------------------------------------------------------
export const roleGrants = pgTable(
  'role_grants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role_id: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    scope: jsonb('scope'), // { scope_type, scope_ids }
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    created_at: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('role_grants_tenant_user_idx').on(table.tenant_id, table.user_id),
    index('role_grants_tenant_role_idx').on(table.tenant_id, table.role_id),
  ],
);
