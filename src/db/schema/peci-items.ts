import { sql } from "drizzle-orm";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const peciItems = mysqlTable("peci_items", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  size: varchar("size", { length: 100 }),
  color: varchar("color", { length: 100 }),
  stock: int("stock").notNull().default(0),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at")
    .default(sql`current_timestamp()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp() on update current_timestamp()`)
    .notNull(),
});

export type PeciItem = typeof peciItems.$inferSelect;
export type NewPeciItem = typeof peciItems.$inferInsert;
