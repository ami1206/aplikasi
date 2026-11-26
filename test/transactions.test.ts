import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { TransactionService } from "../src/services/transaction-service";

const mockRestock = {
  id: 1,
  type: "restock",
  returType: null,
  peciId: 1,
  supplierId: 1,
  quantity: 20,
  notes: "Restock awal",
  createdAt: new Date("2026-01-01"),
};

const mockStockout = {
  id: 2,
  type: "stockout",
  returType: null,
  peciId: 1,
  supplierId: null,
  quantity: 5,
  notes: "Penjualan",
  createdAt: new Date("2026-01-02"),
};

const mockReturIn = {
  id: 3,
  type: "retur",
  returType: "in",
  peciId: 1,
  supplierId: null,
  quantity: 2,
  notes: "Retur dari pembeli",
  createdAt: new Date("2026-01-03"),
};

describe("Transactions API (GET /api/transactions)", () => {
  it("returns 200 and list of transactions", async () => {
    const spy = spyOn(TransactionService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockRestock, mockStockout],
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    spy.mockRestore();
  });

  it("returns 200 when filtered by type", async () => {
    const spy = spyOn(TransactionService, "getAll").mockResolvedValueOnce({
      success: true,
      data: [mockRestock],
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions?type=restock")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith("restock");
    spy.mockRestore();
  });

  it("returns 400 when type query is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/transactions?type=invalid")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

describe("Transactions API (GET /api/transactions/:id)", () => {
  it("returns 200 and transaction detail", async () => {
    const spy = spyOn(TransactionService, "getById").mockResolvedValueOnce({
      success: true,
      data: mockRestock,
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/1")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(1);
    expect(body.data.type).toBe("restock");
    spy.mockRestore();
  });

  it("returns 404 when transaction not found", async () => {
    const spy = spyOn(TransactionService, "getById").mockResolvedValueOnce({
      success: false,
      error: "Transaksi tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/999")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Transaksi tidak ditemukan");
    spy.mockRestore();
  });

  it("returns 400 for invalid id", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/transactions/abc")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID tidak valid");
  });
});

describe("Transactions API (POST /api/transactions/restock)", () => {
  it("returns 201 when restock succeeds", async () => {
    const spy = spyOn(TransactionService, "restock").mockResolvedValueOnce({
      success: true,
      data: mockRestock,
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          supplierId: 1,
          quantity: 20,
          notes: "Restock awal",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.type).toBe("restock");
    expect(body.data.quantity).toBe(20);
    spy.mockRestore();
  });

  it("returns 400 when quantity <= 0", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/transactions/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          quantity: 0,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when peci not found", async () => {
    const spy = spyOn(TransactionService, "restock").mockResolvedValueOnce({
      success: false,
      error: "Peci tidak ditemukan",
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 999,
          quantity: 10,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Peci tidak ditemukan");
    spy.mockRestore();
  });
});

describe("Transactions API (POST /api/transactions/stockout)", () => {
  it("returns 201 when stockout succeeds", async () => {
    const spy = spyOn(TransactionService, "stockout").mockResolvedValueOnce({
      success: true,
      data: mockStockout,
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/stockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          quantity: 5,
          notes: "Penjualan",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.type).toBe("stockout");
    expect(body.data.quantity).toBe(5);
    spy.mockRestore();
  });

  it("returns 400 when stock is insufficient", async () => {
    const spy = spyOn(TransactionService, "stockout").mockResolvedValueOnce({
      success: false,
      error: "Stok peci tidak mencukupi",
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/stockout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          quantity: 999,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Stok peci tidak mencukupi");
    spy.mockRestore();
  });
});

describe("Transactions API (POST /api/transactions/retur)", () => {
  it("returns 201 when retur in succeeds", async () => {
    const spy = spyOn(TransactionService, "retur").mockResolvedValueOnce({
      success: true,
      data: mockReturIn,
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/retur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          returType: "in",
          quantity: 2,
          notes: "Retur dari pembeli",
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.type).toBe("retur");
    expect(body.data.returType).toBe("in");
    spy.mockRestore();
  });

  it("returns 400 when returType is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/transactions/retur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          returType: "invalid",
          quantity: 2,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when retur out exceeds stock", async () => {
    const spy = spyOn(TransactionService, "retur").mockResolvedValueOnce({
      success: false,
      error: "Stok peci tidak mencukupi untuk retur keluar",
    });

    const res = await app.handle(
      new Request("http://localhost/api/transactions/retur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peciId: 1,
          supplierId: 1,
          returType: "out",
          quantity: 100,
        }),
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Stok peci tidak mencukupi untuk retur keluar");
    spy.mockRestore();
  });
});
