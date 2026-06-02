CREATE TABLE `aca` (
	`id` text PRIMARY KEY NOT NULL,
	`military_id` text NOT NULL,
	`work_period` text NOT NULL,
	`work_schedule` text NOT NULL,
	FOREIGN KEY (`military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `garrison` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `garrison_military` (
	`garrison_id` text NOT NULL,
	`military_id` text NOT NULL,
	`work_period` text NOT NULL,
	`work_schedule` text NOT NULL,
	PRIMARY KEY(`garrison_id`, `military_id`),
	FOREIGN KEY (`garrison_id`) REFERENCES `garrison`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `military_rank` (
	`id` text PRIMARY KEY NOT NULL,
	`abbreviation` text NOT NULL,
	`order` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `military_rank_abbreviation_unique` ON `military_rank` (`abbreviation`);--> statement-breakpoint
CREATE UNIQUE INDEX `military_rank_order_unique` ON `military_rank` (`order`);--> statement-breakpoint
CREATE TABLE `military` (
	`id` text PRIMARY KEY NOT NULL,
	`military_rank_id` text NOT NULL,
	`rg` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`military_rank_id`) REFERENCES `military_rank`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `military_rg_unique` ON `military` (`rg`);--> statement-breakpoint
CREATE TABLE `officer` (
	`id` text PRIMARY KEY NOT NULL,
	`military_id` text NOT NULL,
	`work_period` text NOT NULL,
	`work_schedule` text NOT NULL,
	FOREIGN KEY (`military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limit` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` text DEFAULT '[]' NOT NULL,
	`blocked_until` integer
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`device_info` text NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`last_access_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `telephonist` (
	`id` text PRIMARY KEY NOT NULL,
	`military_id` text NOT NULL,
	`work_period` text NOT NULL,
	`work_schedule` text NOT NULL,
	FOREIGN KEY (`military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`military_id` text NOT NULL,
	`role` text NOT NULL,
	`password` text NOT NULL,
	FOREIGN KEY (`military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicle` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`situation` text NOT NULL,
	`complement` text
);
