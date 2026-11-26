import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
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
        const result = await UsersService.getAll(query.search);
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
      }),
      detail: {
        tags: ["Users"],
        summary: "Daftar User / Admin",
        description: "Mengambil daftar user/admin tanpa menyertakan password",
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await UsersService.register(body);

        if (!result.success) {
          set.status = 400;
          return {
            error: result.error,
          };
        }

        set.status = 201;
        return {
          data: result.data,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          error: err.message || "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ format: "email", maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 255 }),
        role: t.Optional(
          t.Union([t.Literal("admin"), t.Literal("staff"), t.Literal("user")])
        ),
      }),
      detail: {
        tags: ["Users"],
        summary: "Registrasi User Baru",
        description: "Mendaftarkan pengguna baru dan mengamankan password menggunakan hash bcrypt",
      },
    }
  )
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const result = await UsersService.getAll(query.search);
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
      }),
      detail: {
        tags: ["Users"],
        summary: "Daftar User / Admin",
        description: "Mengambil daftar user/admin tanpa menyertakan password",
      },
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const result = await UsersService.login(body);

        if (!result.success) {
          set.status = 401;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          error: err.message || "Internal server error",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Login User",
        description: "Autentikasi login pengguna dan membuat token session",
      },
    }
  )
  .get(
    "/current",
    async ({ headers, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      const token = authHeader.substring(7).trim();
      if (!token) {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      try {
        const result = await UsersService.getCurrentUser(token);

        if (!result.success) {
          set.status = 401;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          error: err.message || "Internal server error",
        };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Get Current User",
        description: "Mengambil data profil user saat ini berdasarkan Bearer Token session",
      },
    }
  )
  .delete(
    "/logout",
    async ({ headers, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      const token = authHeader.substring(7).trim();
      if (!token) {
        set.status = 401;
        return {
          error: "Unauthorized",
        };
      }

      try {
        const result = await UsersService.logout(token);

        if (!result.success) {
          set.status = 401;
          return {
            error: result.error,
          };
        }

        set.status = 200;
        return {
          data: result.data,
        };
      } catch (err: any) {
        set.status = 500;
        return {
          error: err.message || "Internal server error",
        };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Logout User",
        description: "Menghapus sesi pengguna aktif berdasarkan Bearer Token",
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
        const result = await UsersService.getById(id);

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
        tags: ["Users"],
        summary: "Detail User / Admin",
        description: "Mengambil detail satu user/admin berdasarkan ID tanpa menyertakan password",
      },
    }
  );
