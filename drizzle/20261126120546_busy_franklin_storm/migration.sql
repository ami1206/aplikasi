CREATE TABLE `peci_items` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`size` varchar(100),
	`color` varchar(100),
	`stock` int NOT NULL DEFAULT 0,
	`notes` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (current_timestamp()),
	`updated_at` timestamp NOT NULL DEFAULT (current_timestamp() on update current_timestamp()),
	CONSTRAINT `code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`address` varchar(500),
	`notes` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (current_timestamp()),
	`updated_at` timestamp NOT NULL DEFAULT (current_timestamp() on update current_timestamp()),
	CONSTRAINT `code_unique` UNIQUE INDEX(`code`)
);
