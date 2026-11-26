import { Elysia, t } from "elysia";
import { PeciService } from "../services/peci-service";

export const peciRoute = new Elysia({ prefix: "/api/peci" })
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
        const result = await PeciService.getAll(query.search);
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
        tags: ["Peci"],
        summary: "Daftar Peci",
        description: "Mengambil daftar semua peci, mendukung pencarian berdasarkan kode atau nama",
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
        const result = await PeciService.getById(id);

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
        tags: ["Peci"],
        summary: "Detail Peci",
        description: "Mengambil detail satu peci berdasarkan ID",
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await PeciService.create(body);

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
        size: t.Optional(t.String({ maxLength: 100 })),
        color: t.Optional(t.String({ maxLength: 100 })),
        stock: t.Optional(t.Number({ minimum: 0 })),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Peci"],
        summary: "Tambah Peci Baru",
        description: "Menambahkan data peci baru ke master",
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
        const result = await PeciService.update(id, body);

        if (!result.success) {
          if (result.error === "Peci tidak ditemukan") {
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
        size: t.Optional(t.String({ maxLength: 100 })),
        color: t.Optional(t.String({ maxLength: 100 })),
        stock: t.Optional(t.Number({ minimum: 0 })),
        notes: t.Optional(t.String({ maxLength: 500 })),
      }),
      detail: {
        tags: ["Peci"],
        summary: "Perbarui Peci",
        description: "Memperbarui data peci berdasarkan ID",
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
        const result = await PeciService.delete(id);

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
        tags: ["Peci"],
        summary: "Hapus Peci",
        description: "Menghapus data peci berdasarkan ID",
      },
    }
  );
