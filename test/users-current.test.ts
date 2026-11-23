import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { UsersService } from "../src/services/users-service";

describe("Get Current User Feature (GET /api/users/current)", () => {
  it("returns 200 and user data when valid Bearer token is provided", async () => {
    const mockUser = {
      id: 1,
      name: "ami",
      email: "ami915@gmail.com",
      created_at: "2026-11-23T13:00:00.000Z",
    };

    const spy = spyOn(UsersService, "getCurrentUser").mockResolvedValueOnce({
      success: true,
      data: mockUser,
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Bearer valid-uuid-token",
        },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: mockUser });
    expect(body.data).not.toHaveProperty("password");
    expect(spy).toHaveBeenCalledWith("valid-uuid-token");
    spy.mockRestore();
  });

  it("returns 401 and { error: 'Unauthorized' } when token is invalid or not found", async () => {
    const spy = spyOn(UsersService, "getCurrentUser").mockResolvedValueOnce({
      success: false,
      error: "Unauthorized",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Bearer invalid-or-expired-token",
        },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
    expect(spy).toHaveBeenCalledWith("invalid-or-expired-token");
    spy.mockRestore();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Authorization header does not use Bearer prefix", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Basic dXNlcjpwYXNz",
        },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Bearer token is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: {
          Authorization: "Bearer ",
        },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
