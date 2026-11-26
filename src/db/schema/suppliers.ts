import { sql } from "drizzle-orm";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: varchar("address", { length: 500 }),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at")
    .default(sql`current_timestamp()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp() on update current_timestamp()`)
    .notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
