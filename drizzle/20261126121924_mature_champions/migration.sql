CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`type` varchar(32) NOT NULL,
	`retur_type` varchar(32),
	`peci_id` int NOT NULL,
	`supplier_id` int,
	`quantity` int NOT NULL,
	`notes` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (current_timestamp())
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_peci_id_peci_items_id_fkey` FOREIGN KEY (`peci_id`) REFERENCES `peci_items`(`id`) ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_supplier_id_suppliers_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL;