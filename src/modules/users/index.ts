import { Elysia, t } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/",
    async () => {
      try {
        const allUsers = await db.select().from(users);
        return {
          success: true,
          data: allUsers,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Get All Users",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (!user) {
          set.status = 404;
          return { success: false, message: "User not found" };
        }
        return { success: true, data: user };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: error.message };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      detail: {
        tags: ["Users"],
        summary: "Get User by ID",
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const [result] = await db.insert(users).values({
          name: body.name,
          email: body.email,
        });
        set.status = 201;
        return {
          success: true,
          message: "User created successfully",
          data: {
            id: result.insertId,
            ...body,
          },
        };
      } catch (error: any) {
        set.status = 500;
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Create User",
      },
    }
  );
