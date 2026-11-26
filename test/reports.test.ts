import { describe, expect, it, spyOn } from "bun:test";
import app from "../src/index";
import { ReportService } from "../src/services/report-service";

const mockStock = [
  {
    id: 1,
    code: "PCI-001",
    name: "Peci Hitam Polos",
    size: "L",
    color: "Hitam",
    stock: 25,
    updatedAt: new Date("2026-01-01"),
  },
];

const mockStockout = [
  {
    id: 1,
    peciId: 1,
    peciCode: "PCI-001",
    peciName: "Peci Hitam Polos",
    quantity: 5,
    notes: "Penjualan",
    createdAt: new Date("2026-01-02"),
  },
];

const mockRestock = [
  {
    id: 2,
    peciId: 1,
    peciCode: "PCI-001",
    peciName: "Peci Hitam Polos",
    supplierId: 1,
    supplierCode: "SUP-001",
    supplierName: "PT Peci Jaya",
    quantity: 30,
    notes: "Restock bulanan",
    createdAt: new Date("2026-01-01"),
  },
];

describe("Reports API (GET /api/reports/stock)", () => {
  it("returns 200 and stock report list", async () => {
    const spy = spyOn(ReportService, "getStockReport").mockResolvedValueOnce({
      success: true,
      data: mockStock,
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/stock")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].code).toBe("PCI-001");
    spy.mockRestore();
  });

  it("returns 200 with search and stockStatus filters", async () => {
    const spy = spyOn(ReportService, "getStockReport").mockResolvedValueOnce({
      success: true,
      data: [],
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/stock?search=hitam&stockStatus=empty")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith({
      search: "hitam",
      stockStatus: "empty",
    });
    spy.mockRestore();
  });

  it("returns 400 when stockStatus is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/reports/stock?stockStatus=invalid")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

describe("Reports API (GET /api/reports/stockout)", () => {
  it("returns 200 and stockout report list", async () => {
    const spy = spyOn(ReportService, "getStockoutReport").mockResolvedValueOnce({
      success: true,
      data: mockStockout,
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/stockout")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].quantity).toBe(5);
    spy.mockRestore();
  });

  it("returns 400 when peciId is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/reports/stockout?peciId=abc")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("peciId tidak valid");
  });

  it("returns 400 when startDate format is invalid", async () => {
    const spy = spyOn(ReportService, "getStockoutReport").mockResolvedValueOnce({
      success: false,
      error: "Format startDate tidak valid",
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/stockout?startDate=not-a-date")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Format startDate tidak valid");
    spy.mockRestore();
  });
});

describe("Reports API (GET /api/reports/restock)", () => {
  it("returns 200 and restock report list", async () => {
    const spy = spyOn(ReportService, "getRestockReport").mockResolvedValueOnce({
      success: true,
      data: mockRestock,
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/restock")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].supplierName).toBe("PT Peci Jaya");
    spy.mockRestore();
  });

  it("returns 200 with peciId and supplierId filters", async () => {
    const spy = spyOn(ReportService, "getRestockReport").mockResolvedValueOnce({
      success: true,
      data: mockRestock,
    });

    const res = await app.handle(
      new Request("http://localhost/api/reports/restock?peciId=1&supplierId=1")
    );

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
      peciId: 1,
      supplierId: 1,
    });
    spy.mockRestore();
  });

  it("returns 400 when supplierId is invalid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/reports/restock?supplierId=-5")
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("supplierId tidak valid");
  });
});
