import { Elysia, t } from "elysia";
import { ReportService } from "../services/report-service";

export const reportRoute = new Elysia({ prefix: "/api/reports" })
  .onError(({ code, error }) => {
    if (code === "VALIDATION") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  })
  .get(
    "/stock",
    async ({ query, set }) => {
      try {
        const result = await ReportService.getStockReport({
          search: query.search,
          stockStatus: query.stockStatus,
        });

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      query: t.Object({
        search: t.Optional(t.String({ maxLength: 255 })),
        stockStatus: t.Optional(
          t.Union([
            t.Literal("all"),
            t.Literal("available"),
            t.Literal("empty"),
            t.Literal("low"),
          ])
        ),
      }),
      detail: {
        tags: ["Reports"],
        summary: "Laporan Stok Peci",
        description:
          "Menampilkan posisi stok peci terkini dengan filter pencarian (kode/nama) dan status stok (all, available, empty, low)",
      },
    }
  )
  .get(
    "/stockout",
    async ({ query, set }) => {
      let peciId: number | undefined;
      if (query.peciId !== undefined) {
        peciId = Number(query.peciId);
        if (isNaN(peciId) || peciId <= 0) {
          set.status = 400;
          return { error: "peciId tidak valid" };
        }
      }

      try {
        const result = await ReportService.getStockoutReport({
          startDate: query.startDate,
          endDate: query.endDate,
          peciId,
        });

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String({ maxLength: 50 })),
        endDate: t.Optional(t.String({ maxLength: 50 })),
        peciId: t.Optional(t.String({ maxLength: 20 })),
      }),
      detail: {
        tags: ["Reports"],
        summary: "Laporan Stockout",
        description:
          "Menampilkan rekap riwayat transaksi pengeluaran/stockout peci dengan filter rentang tanggal dan peciId",
      },
    }
  )
  .get(
    "/restock",
    async ({ query, set }) => {
      let peciId: number | undefined;
      if (query.peciId !== undefined) {
        peciId = Number(query.peciId);
        if (isNaN(peciId) || peciId <= 0) {
          set.status = 400;
          return { error: "peciId tidak valid" };
        }
      }

      let supplierId: number | undefined;
      if (query.supplierId !== undefined) {
        supplierId = Number(query.supplierId);
        if (isNaN(supplierId) || supplierId <= 0) {
          set.status = 400;
          return { error: "supplierId tidak valid" };
        }
      }

      try {
        const result = await ReportService.getRestockReport({
          startDate: query.startDate,
          endDate: query.endDate,
          peciId,
          supplierId,
        });

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String({ maxLength: 50 })),
        endDate: t.Optional(t.String({ maxLength: 50 })),
        peciId: t.Optional(t.String({ maxLength: 20 })),
        supplierId: t.Optional(t.String({ maxLength: 20 })),
      }),
      detail: {
        tags: ["Reports"],
        summary: "Laporan Restock",
        description:
          "Menampilkan rekap riwayat transaksi restock/barang masuk dengan filter rentang tanggal, peciId, dan supplierId",
      },
    }
  );
