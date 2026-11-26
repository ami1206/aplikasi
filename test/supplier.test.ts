import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { SupplierService } from "../src/services/supplier-service";

const mockSupplier = {
  id: 1,
  code: "SUP-001",
  name: "PT Peci Jaya",
  phone: "08123456789",
  address: "Jl. Peci Raya No. 1, Jakarta",
  notes: "Supplier utama",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("Master Supplier CRUD (GET /api/suppliers)", () => {
  it("returns 200 and list of suppliers", async () => {
    const spy = spyOn(SupplierService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockSupplier],
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].code).toBe("SUP-001");
    spy.mockRestore();
  });

  it("returns 200 with search query", async () => {
    const spy = spyOn(SupplierService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockSupplier],
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers?search=jaya")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith("jaya");
    spy.mockRestore();
  });

  it("returns 200 and empty array when no suppliers", async () => {
    const spy = spyOn(SupplierService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    spy.mockRestore();
  });
});

describe("Master Supplier CRUD (GET /api/suppliers/:id)", () => {
  it("returns 200 and supplier detail by id", async () => {
    const spy = spyOn(SupplierService, "getById").mockResolvedValueOnce({
      success: true,
      data: mockSupplier,
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/1")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.code).toBe("SUP-001");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("returns 404 when supplier not found", async () => {
    const spy = spyOn(SupplierService, "getById").mockResolvedValueOnce({
      success: false,
      error: "Supplier tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/999")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Supplier tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers/abc")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});

describe("Master Supplier CRUD (POST /api/suppliers)", () => {
  it("returns 201 when supplier created successfully", async () => {
    const spy = spyOn(SupplierService, "create").mockResolvedValueOnce({
      success: true,
      data: mockSupplier,
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SUP-001",
          name: "PT Peci Jaya",
          phone: "08123456789",
          address: "Jl. Peci Raya No. 1, Jakarta",
          notes: "Supplier utama",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.code).toBe("SUP-001");
    spy.mockRestore();
  });

  it("returns 400 when duplicate code", async () => {
    const spy = spyOn(SupplierService, "create").mockResolvedValueOnce({
      success: false,
      error: "Kode supplier sudah digunakan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SUP-001",
          name: "PT Duplikat",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Kode supplier sudah digunakan");
    spy.mockRestore();
  });

  it("returns 400 when code is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "",
          name: "Supplier Test",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when name is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SUP-002",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when code exceeds max length", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "A".repeat(65),
          name: "Supplier Test",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when phone exceeds max length", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SUP-003",
          name: "Supplier Test",
          phone: "0".repeat(51),
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

describe("Master Supplier CRUD (PUT /api/suppliers/:id)", () => {
  it("returns 200 when supplier updated successfully", async () => {
    const updatedSupplier = { ...mockSupplier, name: "PT Peci Jaya Updated" };
    const spy = spyOn(SupplierService, "update").mockResolvedValueOnce({
      success: true,
      data: updatedSupplier,
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "PT Peci Jaya Updated" }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("PT Peci Jaya Updated");
    expect(spy).toHaveBeenCalledWith(1, { name: "PT Peci Jaya Updated" });
    spy.mockRestore();
  });

  it("returns 404 when supplier not found on update", async () => {
    const spy = spyOn(SupplierService, "update").mockResolvedValueOnce({
      success: false,
      error: "Supplier tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/999", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Supplier tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 when duplicate code on update", async () => {
    const spy = spyOn(SupplierService, "update").mockResolvedValueOnce({
      success: false,
      error: "Kode supplier sudah digunakan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "SUP-DUPLICATE" }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Kode supplier sudah digunakan");
    spy.mockRestore();
  });
});

describe("Master Supplier CRUD (DELETE /api/suppliers/:id)", () => {
  it("returns 200 when supplier deleted successfully", async () => {
    const spy = spyOn(SupplierService, "delete").mockResolvedValueOnce({
      success: true,
      data: "OK",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/1", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBe("OK");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("returns 404 when supplier not found on delete", async () => {
    const spy = spyOn(SupplierService, "delete").mockResolvedValueOnce({
      success: false,
      error: "Supplier tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/suppliers/999", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Supplier tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id on delete", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/suppliers/-1", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});
