import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// --- Core Financial Data ---

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(), // UUID
    source: text('source').default('MANUAL'), // SMS, EMAIL, MANUAL
    type: text('type').notNull(), // DEBIT, CREDIT
    amount: real('amount').notNull(),
    category: text('category').notNull(),
    merchant: text('merchant'),
    account_identifier: text('account_identifier'), // Last 4 digits or logic
    date: integer('date', { mode: 'timestamp' }).notNull(),
    raw_message: text('raw_message'), // For SMS/Email debugging
    is_personal: integer('is_personal', { mode: 'boolean' }).default(true),
    note: text('note'),
    isSynced: integer('is_synced', { mode: 'boolean' }).default(false),
});

export const recurringTransactions = sqliteTable('recurring_transactions', {
    id: text('id').primaryKey(),
    base_transaction_id: text('base_transaction_id'), // Link to original transaction if applicable
    frequency: text('frequency').notNull(), // MONTHLY, QUARTERLY, YEARLY
    expected_amount: real('expected_amount').notNull(),
    expected_day: integer('expected_day').notNull(), // 1-31
    category: text('category').notNull(),
    merchant: text('merchant'),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    next_due_date: integer('next_due_date', { mode: 'timestamp' }),
});

export const budgets = sqliteTable('budgets', {
    id: text('id').primaryKey(),
    user_id: text('user_id'), // For identifying owner in household sync
    type: text('type').default('PERSONAL'), // PERSONAL, HOUSEHOLD
    month: text('month').notNull(), // YYYY-MM
    category: text('category').notNull(),
    allocated_amount: real('allocated_amount').notNull(),
    spent_amount: real('spent_amount').default(0),
    rollover_enabled: integer('rollover_enabled', { mode: 'boolean' }).default(false),
});

// --- Properties & Assets ---

export const properties = sqliteTable('properties', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    purchase_price: real('purchase_price'),
    current_value: real('current_value').notNull(),
    monthly_rent: real('monthly_rent').default(0),
    tenant_name: text('tenant_name'),
    tenant_contact: text('tenant_contact'),
    lease_start: integer('lease_start', { mode: 'timestamp' }),
    lease_end: integer('lease_end', { mode: 'timestamp' }),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
});

export const assets = sqliteTable('assets', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(), // REAL_ESTATE, GOLD, VEHICLE, INVESTMENT, FD, PF, OTHER
    current_value: real('current_value').notNull(),
    purchase_date: integer('purchase_date', { mode: 'timestamp' }),
    purchase_price: real('purchase_price'),
    last_updated: integer('last_updated', { mode: 'timestamp' }).notNull(),
    notes: text('notes'),
});

export const liabilities = sqliteTable('liabilities', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(), // HOME_LOAN, CAR_LOAN, PERSONAL_LOAN, CREDIT_CARD, OTHER
    principal_amount: real('principal_amount'),
    current_outstanding: real('current_outstanding').notNull(),
    interest_rate: real('interest_rate'),
    emi_amount: real('emi_amount'),
    start_date: integer('start_date', { mode: 'timestamp' }),
    end_date: integer('end_date', { mode: 'timestamp' }),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
});

// --- Planning ---

export const firePlans = sqliteTable('fire_plans', {
    id: text('id').primaryKey(),
    target_retirement_year: integer('target_retirement_year').notNull(),
    target_corpus: real('target_corpus').notNull(),
    current_corpus: real('current_corpus').notNull(),
    expected_annual_expenses: real('expected_annual_expenses').notNull(),
    inflation_rate: real('inflation_rate').default(0.06), // 6% default
    created_date: integer('created_date', { mode: 'timestamp' }).notNull(),
    last_updated: integer('last_updated', { mode: 'timestamp' }).notNull(),
});

// --- System & Sync ---

export const syncLogs = sqliteTable('sync_logs', {
    id: text('id').primaryKey(),
    device_id: text('device_id'),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    status: text('status'), // SUCCESS, FAILED, PARTIAL
    error_message: text('error_message'),
});

export const syncDevices = sqliteTable('sync_devices', {
    id: text('id').primaryKey(),
    device_name: text('device_name').notNull(),
    paired_date: integer('paired_date', { mode: 'timestamp' }).notNull(),
    last_sync: integer('last_sync', { mode: 'timestamp' }),
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    public_key: text('public_key'),
});
