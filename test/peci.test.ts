import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { PeciService } from "../src/services/peci-service";

const mockPeci = {
  id: 1,
  code: "PCI-001",
  name: "Peci Hitam Polos",
  size: "L",
  color: "Hitam",
  stock: 50,
  notes: "Peci standar",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("Master Peci CRUD (GET /api/peci)", () => {
  it("returns 200 and list of peci items", async () => {
    const spy = spyOn(PeciService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockPeci],
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].code).toBe("PCI-001");
    spy.mockRestore();
  });

  it("returns 200 with search query", async () => {
    const spy = spyOn(PeciService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockPeci],
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci?search=hitam")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith("hitam");
    spy.mockRestore();
  });

  it("returns 200 and empty array when no items", async () => {
    const spy = spyOn(PeciService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    spy.mockRestore();
  });
});

describe("Master Peci CRUD (GET /api/peci/:id)", () => {
  it("returns 200 and peci detail by id", async () => {
    const spy = spyOn(PeciService, "getById").mockResolvedValueOnce({
      success: true,
      data: mockPeci,
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/1")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.code).toBe("PCI-001");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("returns 404 when peci not found", async () => {
    const spy = spyOn(PeciService, "getById").mockResolvedValueOnce({
      success: false,
      error: "Peci tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/999")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Peci tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci/abc")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});

describe("Master Peci CRUD (POST /api/peci)", () => {
  it("returns 201 when peci created successfully", async () => {
    const spy = spyOn(PeciService, "create").mockResolvedValueOnce({
      success: true,
      data: mockPeci,
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "PCI-001",
          name: "Peci Hitam Polos",
          size: "L",
          color: "Hitam",
          stock: 50,
          notes: "Peci standar",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.code).toBe("PCI-001");
    spy.mockRestore();
  });

  it("returns 400 when duplicate code", async () => {
    const spy = spyOn(PeciService, "create").mockResolvedValueOnce({
      success: false,
      error: "Kode peci sudah digunakan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "PCI-001",
          name: "Peci Duplikat",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Kode peci sudah digunakan");
    spy.mockRestore();
  });

  it("returns 400 when code is empty", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "",
          name: "Peci Test",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when name is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "PCI-002",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when stock is negative", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "PCI-003",
          name: "Peci Test",
          stock: -5,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when code exceeds max length", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "A".repeat(65),
          name: "Peci Test",
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

describe("Master Peci CRUD (PUT /api/peci/:id)", () => {
  it("returns 200 when peci updated successfully", async () => {
    const updatedPeci = { ...mockPeci, name: "Peci Hitam Updated" };
    const spy = spyOn(PeciService, "update").mockResolvedValueOnce({
      success: true,
      data: updatedPeci,
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Peci Hitam Updated" }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Peci Hitam Updated");
    expect(spy).toHaveBeenCalledWith(1, { name: "Peci Hitam Updated" });
    spy.mockRestore();
  });

  it("returns 404 when peci not found on update", async () => {
    const spy = spyOn(PeciService, "update").mockResolvedValueOnce({
      success: false,
      error: "Peci tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/999", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Peci tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 when duplicate code on update", async () => {
    const spy = spyOn(PeciService, "update").mockResolvedValueOnce({
      success: false,
      error: "Kode peci sudah digunakan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "PCI-DUPLICATE" }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Kode peci sudah digunakan");
    spy.mockRestore();
  });
});

describe("Master Peci CRUD (DELETE /api/peci/:id)", () => {
  it("returns 200 when peci deleted successfully", async () => {
    const spy = spyOn(PeciService, "delete").mockResolvedValueOnce({
      success: true,
      data: "OK",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/1", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBe("OK");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("returns 404 when peci not found on delete", async () => {
    const spy = spyOn(PeciService, "delete").mockResolvedValueOnce({
      success: false,
      error: "Peci tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/peci/999", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Peci tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id on delete", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/peci/-1", {
        method: "DELETE",
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});
