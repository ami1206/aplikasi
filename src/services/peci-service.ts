import { db } from "../db";
import { peciItems } from "../db/schema";
import { eq, like, or, sql } from "drizzle-orm";

export interface CreatePeciInput {
  code: string;
  name: string;
  size?: string | null;
  color?: string | null;
  stock?: number;
  notes?: string | null;
}

export interface UpdatePeciInput {
  code?: string;
  name?: string;
  size?: string | null;
  color?: string | null;
  stock?: number;
  notes?: string | null;
}

export type PeciResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class PeciService {
  static async getAll(search?: string): Promise<PeciResult> {
    let query = db.select().from(peciItems);

    if (search) {
      const pattern = `%${search}%`;
      query = query.where(
        or(like(peciItems.code, pattern), like(peciItems.name, pattern))
      ) as typeof query;
    }

    const items = await query;
    return { success: true, data: items };
  }

  static async getById(id: number): Promise<PeciResult> {
    const [item] = await db
      .select()
      .from(peciItems)
      .where(eq(peciItems.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Peci tidak ditemukan" };
    }

    return { success: true, data: item };
  }

  static async create(input: CreatePeciInput): Promise<PeciResult> {
    // Cek duplikasi kode
    const [existing] = await db
      .select({ id: peciItems.id })
      .from(peciItems)
      .where(eq(peciItems.code, input.code))
      .limit(1);

    if (existing) {
      return { success: false, error: "Kode peci sudah digunakan" };
    }

    const [result] = await db.insert(peciItems).values({
      code: input.code,
      name: input.name,
      size: input.size ?? null,
      color: input.color ?? null,
      stock: input.stock ?? 0,
      notes: input.notes ?? null,
    }).$returningId();

    const [created] = await db
      .select()
      .from(peciItems)
      .where(eq(peciItems.id, result.id))
      .limit(1);

    return { success: true, data: created };
  }

  static async update(id: number, input: UpdatePeciInput): Promise<PeciResult> {
    // Cek apakah peci ada
    const [item] = await db
      .select({ id: peciItems.id, code: peciItems.code })
      .from(peciItems)
      .where(eq(peciItems.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Peci tidak ditemukan" };
    }

    // Cek duplikasi kode jika code diubah
    if (input.code && input.code !== item.code) {
      const [duplicate] = await db
        .select({ id: peciItems.id })
        .from(peciItems)
        .where(eq(peciItems.code, input.code))
        .limit(1);

      if (duplicate) {
        return { success: false, error: "Kode peci sudah digunakan" };
      }
    }

    await db
      .update(peciItems)
      .set({
        ...input,
        updatedAt: sql`current_timestamp()`,
      })
      .where(eq(peciItems.id, id));

    const [updated] = await db
      .select()
      .from(peciItems)
      .where(eq(peciItems.id, id))
      .limit(1);

    return { success: true, data: updated };
  }

  static async delete(id: number): Promise<PeciResult<"OK">> {
    const [item] = await db
      .select({ id: peciItems.id })
      .from(peciItems)
      .where(eq(peciItems.id, id))
      .limit(1);

    if (!item) {
      return { success: false, error: "Peci tidak ditemukan" };
    }

    await db.delete(peciItems).where(eq(peciItems.id, id));

    return { success: true, data: "OK" };
  }
}
