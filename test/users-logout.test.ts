import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { UsersService } from "../src/services/users-service";

describe("Logout User Feature (DELETE /api/users/logout)", () => {
  it("returns 200 and { data: 'OK' } when valid token is logged out", async () => {
    const spy = spyOn(UsersService, "logout").mockResolvedValueOnce({
      success: true,
      data: "OK",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer valid-token-uuid",
        },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: "OK" });
    expect(spy).toHaveBeenCalledWith("valid-token-uuid");
    spy.mockRestore();
  });

  it("returns 401 and { error: 'Unauthorized' } when token is invalid or does not exist", async () => {
    const spy = spyOn(UsersService, "logout").mockResolvedValueOnce({
      success: false,
      error: "Unauthorized",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer non-existent-token",
        },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
    expect(spy).toHaveBeenCalledWith("non-existent-token");
    spy.mockRestore();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Authorization header does not use Bearer scheme", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: {
          Authorization: "Token 12345",
        },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when Bearer token is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
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
