import { db } from "../db";
import { peciItems, suppliers, transactions } from "../db/schema";
import { and, eq, gt, gte, like, lte, or } from "drizzle-orm";

export interface StockReportFilters {
  search?: string;
  stockStatus?: "all" | "available" | "empty" | "low";
}

export interface StockoutReportFilters {
  startDate?: string;
  endDate?: string;
  peciId?: number;
}

export interface RestockReportFilters {
  startDate?: string;
  endDate?: string;
  peciId?: number;
  supplierId?: number;
}

export type ReportResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

function parseDateFilter(value: string): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export class ReportService {
  static async getStockReport(
    filters: StockReportFilters = {}
  ): Promise<ReportResult> {
    const conditions = [];

    if (filters.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(
        or(like(peciItems.code, pattern), like(peciItems.name, pattern))
      );
    }

    if (filters.stockStatus === "empty") {
      conditions.push(eq(peciItems.stock, 0));
    } else if (filters.stockStatus === "low") {
      conditions.push(and(gt(peciItems.stock, 0), lte(peciItems.stock, 10)));
    } else if (filters.stockStatus === "available") {
      conditions.push(gt(peciItems.stock, 0));
    }

    const query = db
      .select({
        id: peciItems.id,
        code: peciItems.code,
        name: peciItems.name,
        size: peciItems.size,
        color: peciItems.color,
        stock: peciItems.stock,
        updatedAt: peciItems.updatedAt,
      })
      .from(peciItems);

    const items =
      conditions.length > 0 ? await query.where(and(...conditions)) : await query;

    return { success: true, data: items };
  }

  static async getStockoutReport(
    filters: StockoutReportFilters = {}
  ): Promise<ReportResult> {
    const conditions = [eq(transactions.type, "stockout")];

    if (filters.startDate) {
      const start = parseDateFilter(filters.startDate);
      if (!start) {
        return { success: false, error: "Format startDate tidak valid" };
      }
      conditions.push(gte(transactions.createdAt, start));
    }

    if (filters.endDate) {
      const end = parseDateFilter(filters.endDate);
      if (!end) {
        return { success: false, error: "Format endDate tidak valid" };
      }
      conditions.push(lte(transactions.createdAt, end));
    }

    if (filters.peciId !== undefined) {
      conditions.push(eq(transactions.peciId, filters.peciId));
    }

    const items = await db
      .select({
        id: transactions.id,
        peciId: transactions.peciId,
        peciCode: peciItems.code,
        peciName: peciItems.name,
        quantity: transactions.quantity,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(peciItems, eq(transactions.peciId, peciItems.id))
      .where(and(...conditions));

    return { success: true, data: items };
  }

  static async getRestockReport(
    filters: RestockReportFilters = {}
  ): Promise<ReportResult> {
    const conditions = [eq(transactions.type, "restock")];

    if (filters.startDate) {
      const start = parseDateFilter(filters.startDate);
      if (!start) {
        return { success: false, error: "Format startDate tidak valid" };
      }
      conditions.push(gte(transactions.createdAt, start));
    }

    if (filters.endDate) {
      const end = parseDateFilter(filters.endDate);
      if (!end) {
        return { success: false, error: "Format endDate tidak valid" };
      }
      conditions.push(lte(transactions.createdAt, end));
    }

    if (filters.peciId !== undefined) {
      conditions.push(eq(transactions.peciId, filters.peciId));
    }

    if (filters.supplierId !== undefined) {
      conditions.push(eq(transactions.supplierId, filters.supplierId));
    }

    const items = await db
      .select({
        id: transactions.id,
        peciId: transactions.peciId,
        peciCode: peciItems.code,
        peciName: peciItems.name,
        supplierId: transactions.supplierId,
        supplierCode: suppliers.code,
        supplierName: suppliers.name,
        quantity: transactions.quantity,
        notes: transactions.notes,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(peciItems, eq(transactions.peciId, peciItems.id))
      .leftJoin(suppliers, eq(transactions.supplierId, suppliers.id))
      .where(and(...conditions));

    return { success: true, data: items };
  }
}
