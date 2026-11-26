import { Elysia, t } from "elysia";
import { SupplierService } from "../services/supplier-service";

export const supplierRoute = new Elysia({ prefix: "/api/suppliers" })
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
    async ({ query }) => {
      try {
        const result = await SupplierService.getAll(query.search);
        return { data: result.data };
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Suppliers"],
        summary: "Daftar Supplier",
        description: "Mengambil daftar semua supplier, mendukung pencarian berdasarkan kode atau nama",
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
        const result = await SupplierService.getById(id);

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
        tags: ["Suppliers"],
        summary: "Detail Supplier",
        description: "Mengambil detail satu supplier berdasarkan ID",
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await SupplierService.create(body);

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
        code: t.String({ minLength: 1, maxLength: 64 }),
        name: t.String({ minLength: 1, maxLength: 255 }),
        phone: t.Optional(t.String({ maxLength: 50 })),
        address: t.Optional(t.String({ maxLength: 500 })),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Suppliers"],
        summary: "Tambah Supplier Baru",
        description: "Menambahkan data supplier baru ke master",
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const id = Number(params.id);
      if (isNaN(id) || id <= 0) {
        set.status = 400;
        return { error: "ID tidak valid" };
      }

      try {
        const result = await SupplierService.update(id, body);

        if (!result.success) {
          if (result.error === "Supplier tidak ditemukan") {
            set.status = 404;
          } else {
            set.status = 400;
          }
          return { error: result.error };
        }

        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      body: t.Object({
        code: t.Optional(t.String({ minLength: 1, maxLength: 64 })),
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        phone: t.Optional(t.String({ maxLength: 50 })),
        address: t.Optional(t.String({ maxLength: 500 })),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Suppliers"],
        summary: "Perbarui Supplier",
        description: "Memperbarui data supplier berdasarkan ID",
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (isNaN(id) || id <= 0) {
        set.status = 400;
        return { error: "ID tidak valid" };
      }

      try {
        const result = await SupplierService.delete(id);

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
        tags: ["Suppliers"],
        summary: "Hapus Supplier",
        description: "Menghapus data supplier berdasarkan ID",
      },
    }
  );
