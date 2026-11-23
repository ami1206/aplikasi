import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("API Endpoints", () => {
  it("GET / returns basic API info", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Aplikasi Backend API");
    expect(body.health).toBe("/health");
  });

  it("GET /health returns health status", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("database");
  });

  it("GET /swagger returns swagger documentation", async () => {
    const res = await app.handle(new Request("http://localhost/swagger"));
    expect(res.status).toBe(200);
  });
});
