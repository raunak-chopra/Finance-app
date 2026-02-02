CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`current_value` real NOT NULL,
	`purchase_date` integer,
	`purchase_price` real,
	`last_updated` integer NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text DEFAULT 'PERSONAL',
	`month` text NOT NULL,
	`category` text NOT NULL,
	`allocated_amount` real NOT NULL,
	`spent_amount` real DEFAULT 0,
	`rollover_enabled` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `fire_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`target_retirement_year` integer NOT NULL,
	`target_corpus` real NOT NULL,
	`current_corpus` real NOT NULL,
	`expected_annual_expenses` real NOT NULL,
	`inflation_rate` real DEFAULT 0.06,
	`created_date` integer NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `liabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`principal_amount` real,
	`current_outstanding` real NOT NULL,
	`interest_rate` real,
	`emi_amount` real,
	`start_date` integer,
	`end_date` integer,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`purchase_price` real,
	`current_value` real NOT NULL,
	`monthly_rent` real DEFAULT 0,
	`tenant_name` text,
	`tenant_contact` text,
	`lease_start` integer,
	`lease_end` integer,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`base_transaction_id` text,
	`frequency` text NOT NULL,
	`expected_amount` real NOT NULL,
	`expected_day` integer NOT NULL,
	`category` text NOT NULL,
	`merchant` text,
	`is_active` integer DEFAULT true,
	`next_due_date` integer
);
--> statement-breakpoint
CREATE TABLE `sync_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`device_name` text NOT NULL,
	`paired_date` integer NOT NULL,
	`last_sync` integer,
	`is_active` integer DEFAULT true,
	`public_key` text
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text,
	`timestamp` integer NOT NULL,
	`status` text,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text DEFAULT 'MANUAL',
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`merchant` text,
	`account_identifier` text,
	`date` integer NOT NULL,
	`raw_message` text,
	`is_personal` integer DEFAULT true,
	`note` text,
	`is_synced` integer DEFAULT false
);
