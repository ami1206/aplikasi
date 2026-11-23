import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config/env";
import { healthRoutes } from "./modules/health";
import { userRoutes } from "./modules/users";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Aplikasi Backend API",
          version: "1.0.0",
          description: "RESTful API built with Bun, ElysiaJS, Drizzle ORM, and MySQL",
        },
        tags: [
          { name: "System", description: "System and health check endpoints" },
          { name: "Users", description: "User management endpoints" },
        ],
      },
      path: "/swagger",
    })
  )
  .get("/", () => ({
    name: "Aplikasi Backend API",
    version: "1.0.0",
    docs: "/swagger",
    health: "/health",
  }))
  .use(healthRoutes)
  .use(userRoutes)
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Route not found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { success: false, message: "Validation error", error: error.message };
    }
    set.status = 500;
    return { success: false, message: "Internal server error", error: error.message };
  })
  .listen(config.port);

console.log(`🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger documentation at http://${app.server?.hostname}:${app.server?.port}/swagger`);

export type App = typeof app;
export default app;
