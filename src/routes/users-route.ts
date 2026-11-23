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
      name: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
    detail: {
      tags: ["Users"],
      summary: "Registrasi User Baru",
      description: "Mendaftarkan pengguna baru dan mengamankan password menggunakan hash bcrypt",
    },
  }
);
