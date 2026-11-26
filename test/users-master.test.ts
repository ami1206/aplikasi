import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { UsersService } from "../src/services/users-service";

const mockUsers = [
  {
    id: 1,
    name: "Admin Utama",
    email: "admin@peci.com",
    role: "admin",
    created_at: new Date("2026-01-01"),
  },
  {
    id: 2,
    name: "Staff Gudang",
    email: "staff@peci.com",
    role: "staff",
    created_at: new Date("2026-01-02"),
  },
];

describe("Master Admin / User (GET /api/users)", () => {
  it("returns 200 and list of users without password", async () => {
    const spy = spyOn(UsersService, "getAll").mockResolvedValueOnce({
      success: true,
      data: mockUsers,
    });

    const res = await app.handle(new Request("http://localhost/api/users"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].email).toBe("admin@peci.com");
    expect(body.data[0].role).toBe("admin");
    expect(body.data[0].password).toBeUndefined();
    spy.mockRestore();
  });

  it("returns 200 with search query", async () => {
    const spy = spyOn(UsersService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockUsers[0]],
    });

    const res = await app.handle(
      new Request("http://localhost/api/users?search=admin")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith("admin");
    spy.mockRestore();
  });

  it("returns 400 when search query exceeds max length", async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/users?search=${"a".repeat(256)}`)
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

describe("Master Admin / User (GET /api/users/:id)", () => {
  it("returns 200 and user detail without password", async () => {
    const spy = spyOn(UsersService, "getById").mockResolvedValueOnce({
      success: true,
      data: mockUsers[0],
    });

    const res = await app.handle(new Request("http://localhost/api/users/1"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(1);
    expect(body.data.email).toBe("admin@peci.com");
    expect(body.data.password).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("returns 404 when user is not found", async () => {
    const spy = spyOn(UsersService, "getById").mockResolvedValueOnce({
      success: false,
      error: "User tidak ditemukan",
    });

    const res = await app.handle(new Request("http://localhost/api/users/999"));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("User tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id", async () => {
    const res = await app.handle(new Request("http://localhost/api/users/abc"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});

describe("Master Admin / User Validation (POST /api/users)", () => {
  it("returns 201 when registering user with valid role", async () => {
    const spy = spyOn(UsersService, "register").mockResolvedValueOnce({
      success: true,
      data: "OK",
    });

    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin Baru",
          email: "adminbaru@peci.com",
          password: "password123",
          role: "admin",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ data: "OK" });
    spy.mockRestore();
  });

  it("returns 400 when role is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "User",
          email: "user@peci.com",
          password: "password123",
          role: "superadmin",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when name exceeds max length", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "A".repeat(256),
          email: "user@peci.com",
          password: "password123",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
