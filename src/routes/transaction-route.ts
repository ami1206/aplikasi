import { Elysia, t } from "elysia";
import { TransactionService } from "../services/transaction-service";

export const transactionRoute = new Elysia({ prefix: "/api/transactions" })
  .onError(({ code, error }) => {
    if (code === "VALIDATION") {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const result = await TransactionService.getAll(query.type);
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      query: t.Object({
        type: t.Optional(
          t.Union([
            t.Literal("restock"),
            t.Literal("stockout"),
            t.Literal("retur"),
          ])
        ),
      }),
      detail: {
        tags: ["Transactions"],
        summary: "Daftar Transaksi",
        description: "Mengambil daftar riwayat transaksi (restock, stockout, retur)",
      },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (isNaN(id) || id <= 0) {
        set.status = 400;
        return { error: "ID tidak valid" };
      }

      try {
        const result = await TransactionService.getById(id);

        if (!result.success) {
          set.status = 404;
          return { error: result.error };
        }

        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Transactions"],
        summary: "Detail Transaksi",
        description: "Mengambil detail satu transaksi berdasarkan ID",
      },
    }
  )
  .post(
    "/restock",
    async ({ body, set }) => {
      try {
        const result = await TransactionService.restock(body);

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        set.status = 201;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      body: t.Object({
        peciId: t.Number({ minimum: 1 }),
        supplierId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
        quantity: t.Number({ minimum: 1 }),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Transactions"],
        summary: "Transaksi Restock",
        description: "Mencatat barang masuk dan menambah stok peci",
      },
    }
  )
  .post(
    "/stockout",
    async ({ body, set }) => {
      try {
        const result = await TransactionService.stockout(body);

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        set.status = 201;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      body: t.Object({
        peciId: t.Number({ minimum: 1 }),
        quantity: t.Number({ minimum: 1 }),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Transactions"],
        summary: "Transaksi Stockout",
        description: "Mencatat barang keluar dan mengurangi stok peci",
      },
    }
  )
  .post(
    "/retur",
    async ({ body, set }) => {
      try {
        const result = await TransactionService.retur(body);

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        set.status = 201;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      body: t.Object({
        peciId: t.Number({ minimum: 1 }),
        supplierId: t.Optional(t.Union([t.Number({ minimum: 1 }), t.Null()])),
        returType: t.Union([t.Literal("in"), t.Literal("out")]),
        quantity: t.Number({ minimum: 1 }),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Transactions"],
        summary: "Transaksi Retur",
        description: "Mencatat pengembalian barang dan menyesuaikan stok peci",
      },
    }
  );
