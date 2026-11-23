import { Elysia } from "elysia";
import { poolConnection } from "../../db";

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get(
    "/",
    async () => {
      let dbStatus = "connected";
      try {
        await poolConnection.query("SELECT 1");
      } catch (err: any) {
        dbStatus = `disconnected (${err.message})`;
      }

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
      };
    },
    {
      detail: {
        tags: ["System"],
        summary: "Health Check",
        description: "Returns server status and database connectivity check",
      },
    }
  );
