import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

const app = createApp();

beforeEach(() => {
  store.reset();
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function createCart() {
  const res = await request(app).post("/api/carts");
  expect(res.status).toBe(201);
  return res.body.id as string;
}

// ── POST /api/carts ───────────────────────────────────────────────────────────

describe("POST /api/carts", () => {
  it("creates a cart and returns 201 with an id and empty items array", async () => {
    const res = await request(app).post("/api/carts");
    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe("string");
    expect(res.body.items).toEqual([]);
  });

  it("each created cart has a unique id", async () => {
    const a = await createCart();
    const b = await createCart();
    expect(a).not.toBe(b);
  });
});

// ── GET /api/carts/:cartId ────────────────────────────────────────────────────

describe("GET /api/carts/:cartId", () => {
  it("returns the cart by id", async () => {
    const cartId = await createCart();
    const res = await request(app).get(`/api/carts/${cartId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(cartId);
  });

  it("responds 404 for an unknown cart", async () => {
    const res = await request(app).get("/api/carts/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

// ── PUT /api/carts/:cartId/items/:bookId ─────────────────────────────────────

describe("PUT /api/carts/:cartId/items/:bookId", () => {
  it("adds a book to the cart", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ bookId: "the-lantern-sea", quantity: 2 });
  });

  it("updates quantity when the same book is added again", async () => {
    const cartId = await createCart();
    await request(app).put(`/api/carts/${cartId}/items/the-lantern-sea`).send({ quantity: 1 });
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it("snapshots unitPrice from the book catalogue", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: 1 });
    expect(res.body.items[0].unitPrice).toBe(14.99);
  });

  it("responds 404 for an unknown cart", async () => {
    const res = await request(app)
      .put("/api/carts/no-cart/items/the-lantern-sea")
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("responds 404 for an unknown book", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/no-such-book`)
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("responds 400 when quantity is 0", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: 0 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("responds 400 when quantity is negative", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: -1 });
    expect(res.status).toBe(400);
  });

  it("responds 400 when quantity is not an integer", async () => {
    const cartId = await createCart();
    const res = await request(app)
      .put(`/api/carts/${cartId}/items/the-lantern-sea`)
      .send({ quantity: 1.5 });
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/carts/:cartId/items/:bookId ───────────────────────────────────

describe("DELETE /api/carts/:cartId/items/:bookId", () => {
  it("removes a line item from the cart", async () => {
    const cartId = await createCart();
    await request(app).put(`/api/carts/${cartId}/items/the-lantern-sea`).send({ quantity: 1 });
    await request(app).put(`/api/carts/${cartId}/items/paper-mountains`).send({ quantity: 1 });
    const res = await request(app).delete(`/api/carts/${cartId}/items/the-lantern-sea`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].bookId).toBe("paper-mountains");
  });

  it("responds 404 for an unknown cart", async () => {
    const res = await request(app).delete("/api/carts/no-cart/items/the-lantern-sea");
    expect(res.status).toBe(404);
  });
});

// ── POST /api/carts/:cartId/checkout ─────────────────────────────────────────

describe("POST /api/carts/:cartId/checkout", () => {
  it("returns an order with correct total and destroys the cart", async () => {
    const cartId = await createCart();
    await request(app).put(`/api/carts/${cartId}/items/the-lantern-sea`).send({ quantity: 2 });
    const res = await request(app).post(`/api/carts/${cartId}/checkout`);
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe("string");
    expect(res.body.total).toBeCloseTo(14.99 * 2);
    expect(res.body.items).toHaveLength(1);

    // Cart should be gone.
    const cartRes = await request(app).get(`/api/carts/${cartId}`);
    expect(cartRes.status).toBe(404);
  });

  it("decrements stock after checkout", async () => {
    const cartId = await createCart();
    await request(app).put(`/api/carts/${cartId}/items/the-lantern-sea`).send({ quantity: 3 });
    await request(app).post(`/api/carts/${cartId}/checkout`);
    const book = await request(app).get("/api/books/the-lantern-sea");
    expect(book.body.stock).toBe(12 - 3);
  });

  it("responds 400 when the cart is empty", async () => {
    const cartId = await createCart();
    const res = await request(app).post(`/api/carts/${cartId}/checkout`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cart is empty");
  });

  it("responds 409 when quantity exceeds stock", async () => {
    const cartId = await createCart();
    await request(app).put(`/api/carts/${cartId}/items/the-lantern-sea`).send({ quantity: 999 });
    const res = await request(app).post(`/api/carts/${cartId}/checkout`);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Insufficient stock/);
  });

  it("responds 404 for an unknown cart", async () => {
    const res = await request(app).post("/api/carts/no-cart/checkout");
    expect(res.status).toBe(404);
  });
});
