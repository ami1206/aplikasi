import { sql } from "drizzle-orm";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { peciItems } from "./peci-items";
import { suppliers } from "./suppliers";

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 32 }).notNull(), // 'restock' | 'stockout' | 'retur'
  returType: varchar("retur_type", { length: 32 }), // 'in' | 'out' (khusus retur)
  peciId: int("peci_id")
    .notNull()
    .references(() => peciItems.id, { onDelete: "restrict" }),
  supplierId: int("supplier_id").references(() => suppliers.id, {
    onDelete: "set null",
  }),
  quantity: int("quantity").notNull(),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at")
    .default(sql`current_timestamp()`)
    .notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
