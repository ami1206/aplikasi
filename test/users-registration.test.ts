import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { UsersService } from "../src/services/users-service";

describe("User Registration Feature", () => {
  it("hashes password with bcrypt correctly", async () => {
    const rawPassword = "rahasia";
    const hash = await Bun.password.hash(rawPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });
    expect(hash.startsWith("$2")).toBe(true);
    const isMatch = await Bun.password.verify(rawPassword, hash);
    expect(isMatch).toBe(true);
  });

  it("POST /api/users returns 201 and { data: 'OK' } when registration is successful", async () => {
    const spy = spyOn(UsersService, "register").mockResolvedValueOnce({
      success: true,
      data: "OK",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ami",
          email: "ami915@gmail.com",
          password: "rahasia",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ data: "OK" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("POST /api/users returns 400 and { error: 'Email sudah terdaftar' } when email already exists", async () => {
    const spy = spyOn(UsersService, "register").mockResolvedValueOnce({
      success: false,
      error: "Email sudah terdaftar",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ami",
          email: "ami915@gmail.com",
          password: "rahasia",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Email sudah terdaftar" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("POST /api/users returns 400 when validation fails (invalid email)", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ami",
          email: "invalid-email-format",
          password: "rahasia",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
