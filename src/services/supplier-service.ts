import { db } from "../db";
import { suppliers } from "../db/schema";
import { eq, like, or, sql } from "drizzle-orm";

export interface CreateSupplierInput {
  code: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierInput {
  code?: string;
  name?: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export type SupplierResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class SupplierService {
  static async getAll(search?: string): Promise<SupplierResult> {
    let query = db.select().from(suppliers);

    if (search) {
      const pattern = `%${search}%`;
      query = query.where(
        or(like(suppliers.code, pattern), like(suppliers.name, pattern))
      ) as typeof query;
    }

    const items = await query;
    return { success: true, data: items };
  }

  static async getById(id: number): Promise<SupplierResult> {
    const [item] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    return { success: true, data: item };
  }

  static async create(input: CreateSupplierInput): Promise<SupplierResult> {
    // Cek duplikasi kode
    const [existing] = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.code, input.code))
      .limit(1);

    if (existing) {
      return { success: false, error: "Kode supplier sudah digunakan" };
    }

    const [result] = await db.insert(suppliers).values({
      code: input.code,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    }).$returningId();

    const [created] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, result.id))
      .limit(1);

    return { success: true, data: created };
  }

  static async update(id: number, input: UpdateSupplierInput): Promise<SupplierResult> {
    // Cek apakah supplier ada
    const [item] = await db
      .select({ id: suppliers.id, code: suppliers.code })
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    // Cek duplikasi kode jika code diubah
    if (input.code && input.code !== item.code) {
      const [duplicate] = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.code, input.code))
        .limit(1);

      if (duplicate) {
        return { success: false, error: "Kode supplier sudah digunakan" };
      }
    }

    await db
      .update(suppliers)
      .set({
        ...input,
        updatedAt: sql`current_timestamp()`,
      })
      .where(eq(suppliers.id, id));

    const [updated] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    return { success: true, data: updated };
  }

  static async delete(id: number): Promise<SupplierResult<"OK">> {
    const [item] = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Supplier tidak ditemukan" };
    }

    await db.delete(suppliers).where(eq(suppliers.id, id));

    return { success: true, data: "OK" };
  }
}
