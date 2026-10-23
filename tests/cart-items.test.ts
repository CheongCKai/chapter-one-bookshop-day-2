import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

const app = createApp();
let cartId: string;
const bookId = "the-lantern-sea";
beforeEach(async () => {
  store.reset();
  cartId = (await request(app).post("/api/carts")).body.cartId;
});
const add = (body: object) => request(app).post(`/api/carts/${cartId}/items`).send(body);
const load = () => request(app).get(`/api/carts/${cartId}`);

describe("cart additions", () => {
  it("uses catalogue prices and merges repeated books into one line", async () => {
    const first = await add({ bookId, quantity: 1, title: "Fake", unitPrice: 0 });
    expect(first.status).toBe(200);
    const merged = await add({ bookId, quantity: 1 });
    expect(merged.status).toBe(200);
    expect(merged.body.items).toEqual([
      {
        bookId,
        title: "The Light Between Oceans",
        unitPrice: 14.99,
        quantity: 2,
        lineTotal: 29.98,
      },
    ]);
    expect(merged.body.total).toBe(29.98);
  });

  it("adds another book and sums prices in cents", async () => {
    await add({ bookId, quantity: 2 });
    const result = await add({ bookId: "paper-mountains", quantity: 1 });
    expect(result.status).toBe(200);
    expect(result.body.items).toHaveLength(2);
    expect(result.body.total).toBe(43.47);
  });

  it("accepts exactly stock and rejects a combined over-stock addition without mutation", async () => {
    const before = (await request(app).get("/api/books")).body;
    const full = await add({ bookId, quantity: 12 });
    expect(full.status).toBe(200);
    expect(full.body.total).toBe(179.88);
    expect((await add({ bookId, quantity: 1 })).status).toBe(400);
    expect((await load()).body).toEqual(full.body);
    expect((await request(app).get("/api/books")).body).toEqual(before);
  });

  it.each([0, -1, 1.5, "2", null, true, Number.MAX_SAFE_INTEGER + 1, undefined])(
    "rejects invalid quantity %s without mutation",
    async (quantity) => {
      const before = (await load()).body;
      const result = await add({ bookId, quantity });
      expect(result.status).toBe(400);
      expect(result.body).toEqual({ error: expect.any(String) });
      expect((await load()).body).toEqual(before);
    },
  );

  it.each([
    {},
    { bookId: "", quantity: 1 },
    { bookId: "  ", quantity: 1 },
    { bookId: 3, quantity: 1 },
    [],
  ])("rejects invalid body %j", async (body) => {
    const before = (await load()).body;
    const result = await add(body);
    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: expect.any(String) });
    expect((await load()).body).toEqual(before);
  });

  it.each(["null", "3", '"text"', "{"])(
    "returns JSON 400 for invalid JSON body %s",
    async (body) => {
      const result = await request(app)
        .post(`/api/carts/${cartId}/items`)
        .set("Content-Type", "application/json")
        .send(body);
      expect(result.status).toBe(400);
      expect(result.type).toBe("application/json");
      expect(result.body).toEqual({ error: expect.any(String) });
      expect((await load()).body.items).toEqual([]);
    },
  );

  it("returns JSON 404 for an unknown cart or book", async () => {
    const missingCart = await request(app)
      .post("/api/carts/missing/items")
      .send({ bookId, quantity: 1 });
    expect(missingCart.status).toBe(404);
    expect(missingCart.body).toEqual({ error: expect.any(String) });
    const missingBook = await add({ bookId: "missing", quantity: 1 });
    expect(missingBook.status).toBe(404);
    expect(missingBook.body).toEqual({ error: expect.any(String) });
    expect((await load()).body.items).toEqual([]);
  });

  it("keeps cart contents isolated", async () => {
    const second = (await request(app).post("/api/carts")).body;
    await add({ bookId, quantity: 2 });
    expect((await request(app).get(`/api/carts/${second.cartId}`)).body).toEqual(second);
  });
});
