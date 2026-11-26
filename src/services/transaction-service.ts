import { db } from "../db";
import { peciItems, suppliers, transactions } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export interface RestockInput {
  peciId: number;
  supplierId?: number | null;
  quantity: number;
  notes?: string | null;
}

export interface StockoutInput {
  peciId: number;
  quantity: number;
  notes?: string | null;
}

export interface ReturInput {
  peciId: number;
  supplierId?: number | null;
  returType: "in" | "out";
  quantity: number;
  notes?: string | null;
}

export type TransactionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class TransactionService {
  static async getAll(type?: string): Promise<TransactionResult> {
    let query = db.select().from(transactions);

    if (type) {
      query = query.where(eq(transactions.type, type)) as typeof query;
    }

    const items = await query;
    return { success: true, data: items };
  }

  static async getById(id: number): Promise<TransactionResult> {
    const [item] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    return { success: true, data: item };
  }

  static async restock(input: RestockInput): Promise<TransactionResult> {
    if (input.quantity <= 0) {
      return { success: false, error: "Quantity harus lebih dari 0" };
    }

    return await db.transaction(async (tx) => {
      const [peci] = await tx
        .select({ id: peciItems.id })
        .from(peciItems)
        .where(eq(peciItems.id, input.peciId))
        .limit(1);

      if (!peci) {
        return { success: false, error: "Peci tidak ditemukan" };
      }

      if (input.supplierId !== undefined && input.supplierId !== null) {
        const [supplier] = await tx
          .select({ id: suppliers.id })
          .from(suppliers)
          .where(eq(suppliers.id, input.supplierId))
          .limit(1);

        if (!supplier) {
          return { success: false, error: "Supplier tidak ditemukan" };
        }
      }

      await tx
        .update(peciItems)
        .set({
          stock: sql`${peciItems.stock} + ${input.quantity}`,
          updatedAt: sql`current_timestamp()`,
        })
        .where(eq(peciItems.id, input.peciId));

      const [inserted] = await tx
        .insert(transactions)
        .values({
          type: "restock",
          returType: null,
          peciId: input.peciId,
          supplierId: input.supplierId ?? null,
          quantity: input.quantity,
          notes: input.notes ?? null,
        })
        .$returningId();

      const [created] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, inserted.id))
        .limit(1);

      return { success: true, data: created };
    });
  }

  static async stockout(input: StockoutInput): Promise<TransactionResult> {
    if (input.quantity <= 0) {
      return { success: false, error: "Quantity harus lebih dari 0" };
    }

    return await db.transaction(async (tx) => {
      const [peci] = await tx
        .select({ id: peciItems.id, stock: peciItems.stock })
        .from(peciItems)
        .where(eq(peciItems.id, input.peciId))
        .limit(1);

      if (!peci) {
        return { success: false, error: "Peci tidak ditemukan" };
      }

      if (peci.stock < input.quantity) {
        return { success: false, error: "Stok peci tidak mencukupi" };
      }

      await tx
        .update(peciItems)
        .set({
          stock: sql`${peciItems.stock} - ${input.quantity}`,
          updatedAt: sql`current_timestamp()`,
        })
        .where(eq(peciItems.id, input.peciId));

      const [inserted] = await tx
        .insert(transactions)
        .values({
          type: "stockout",
          returType: null,
          peciId: input.peciId,
          supplierId: null,
          quantity: input.quantity,
          notes: input.notes ?? null,
        })
        .$returningId();

      const [created] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, inserted.id))
        .limit(1);

      return { success: true, data: created };
    });
  }

  static async retur(input: ReturInput): Promise<TransactionResult> {
    if (input.quantity <= 0) {
      return { success: false, error: "Quantity harus lebih dari 0" };
    }

    if (input.returType !== "in" && input.returType !== "out") {
      return { success: false, error: "Tipe retur tidak valid (gunakan 'in' atau 'out')" };
    }

    return await db.transaction(async (tx) => {
      const [peci] = await tx
        .select({ id: peciItems.id, stock: peciItems.stock })
        .from(peciItems)
        .where(eq(peciItems.id, input.peciId))
        .limit(1);

      if (!peci) {
        return { success: false, error: "Peci tidak ditemukan" };
      }

      if (input.supplierId !== undefined && input.supplierId !== null) {
        const [supplier] = await tx
          .select({ id: suppliers.id })
          .from(suppliers)
          .where(eq(suppliers.id, input.supplierId))
          .limit(1);

        if (!supplier) {
          return { success: false, error: "Supplier tidak ditemukan" };
        }
      }

      if (input.returType === "out" && peci.stock < input.quantity) {
        return {
          success: false,
          error: "Stok peci tidak mencukupi untuk retur keluar",
        };
      }

      const stockDelta =
        input.returType === "in"
          ? sql`${peciItems.stock} + ${input.quantity}`
          : sql`${peciItems.stock} - ${input.quantity}`;

      await tx
        .update(peciItems)
        .set({
          stock: stockDelta,
          updatedAt: sql`current_timestamp()`,
        })
        .where(eq(peciItems.id, input.peciId));

      const [inserted] = await tx
        .insert(transactions)
        .values({
          type: "retur",
          returType: input.returType,
          peciId: input.peciId,
          supplierId: input.supplierId ?? null,
          quantity: input.quantity,
          notes: input.notes ?? null,
        })
        .$returningId();

      const [created] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, inserted.id))
        .limit(1);

      return { success: true, data: created };
    });
  }
}
