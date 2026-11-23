import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { UsersService } from "../src/services/users-service";

describe("User Login & Session Feature", () => {
  it("generates valid UUID token format", () => {
    const token = crypto.randomUUID();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(token)).toBe(true);
  });

  it("POST /api/users/login returns 200 and { data: token } on successful login", async () => {
    const sampleToken = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
    const spy = spyOn(UsersService, "login").mockResolvedValueOnce({
      success: true,
      data: sampleToken,
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ami915@gmail.com",
          password: "rahasia",
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: sampleToken });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("POST /api/users/login returns 401 and { error: 'Email atau password salah' } on invalid credentials", async () => {
    const spy = spyOn(UsersService, "login").mockResolvedValueOnce({
      success: false,
      error: "Email atau password salah",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ami915@gmail.com",
          password: "salah-password",
        }),
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Email atau password salah" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("POST /api/users/login returns 400 when validation fails (invalid email)", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "bukan-email-valid",
          password: "rahasia",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
