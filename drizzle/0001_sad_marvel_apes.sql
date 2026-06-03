CREATE TABLE `service_swap` (
	`id` text PRIMARY KEY NOT NULL,
	`substituted_military_id` text NOT NULL,
	`substitute_military_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	FOREIGN KEY (`substituted_military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`substitute_military_id`) REFERENCES `military`(`id`) ON UPDATE no action ON DELETE no action
);
