import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

const app = createApp();
const bookId = "the-lantern-sea";
let cartId: string;
const load = () => request(app).get(`/api/carts/${cartId}`);
const update = (body: object, id = bookId) =>
  request(app).patch(`/api/carts/${cartId}/items/${id}`).send(body);
const remove = (id = bookId) => request(app).delete(`/api/carts/${cartId}/items/${id}`);

beforeEach(async () => {
  store.reset();
  cartId = (await request(app).post("/api/carts")).body.cartId;
  const added = await request(app).post(`/api/carts/${cartId}/items`).send({ bookId, quantity: 2 });
  expect(added.status).toBe(200);
});

describe("cart quantity changes", () => {
  it("replaces a quantity and recalculates line and cart totals in cents", async () => {
    await request(app)
      .post(`/api/carts/${cartId}/items`)
      .send({ bookId: "paper-mountains", quantity: 1 });
    const updated = await update({ quantity: 3, unitPrice: 0, title: "Fake" });
    expect(updated.status).toBe(200);
    expect(updated.body.items[0]).toEqual({
      bookId,
      title: "The Light Between Oceans",
      unitPrice: 14.99,
      quantity: 3,
      lineTotal: 44.97,
    });
    expect(updated.body.items[1].quantity).toBe(1);
    expect(updated.body.total).toBe(58.46);
    expect((await load()).body).toEqual(updated.body);
  });

  it("accepts exactly available stock without deducting stock or changing another cart", async () => {
    const catalogue = (await request(app).get("/api/books")).body;
    const other = (await request(app).post("/api/carts")).body;
    const updated = await update({ quantity: 12 });
    expect(updated.status).toBe(200);
    expect(updated.body.items[0].quantity).toBe(12);
    expect(updated.body.total).toBe(179.88);
    expect((await request(app).get("/api/books")).body).toEqual(catalogue);
    expect((await request(app).get(`/api/carts/${other.cartId}`)).body).toEqual(other);
  });

  it.each([0, -1, 1.5, "2", null, true, Number.MAX_SAFE_INTEGER + 1, undefined, 13])(
    "rejects invalid or over-stock replacement %s without mutation",
    async (quantity) => {
      const before = (await load()).body;
      const catalogue = (await request(app).get("/api/books")).body;
      const response = await update({ quantity });
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body).toEqual({ error: expect.any(String) });
      expect((await load()).body).toEqual(before);
      expect((await request(app).get("/api/books")).body).toEqual(catalogue);
    },
  );

  it.each([{ body: [] }, { body: {} }, { body: { quantity: {} } }])(
    "rejects invalid replacement body $body",
    async ({ body }) => {
      const before = (await load()).body;
      const response = await update(body);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: expect.any(String) });
      expect((await load()).body).toEqual(before);
    },
  );

  it.each(["null", "3", '"text"', "{"])(
    "returns JSON 400 for invalid JSON replacement %s",
    async (body) => {
      const before = (await load()).body;
      const response = await request(app)
        .patch(`/api/carts/${cartId}/items/${bookId}`)
        .set("Content-Type", "application/json")
        .send(body);
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body).toEqual({ error: expect.any(String) });
      expect((await load()).body).toEqual(before);
    },
  );

  it("returns JSON 404 for missing carts, books and existing books absent from the cart", async () => {
    const before = (await load()).body;
    for (const path of [
      `/api/carts/missing/items/${bookId}`,
      `/api/carts/${cartId}/items/missing`,
      `/api/carts/${cartId}/items/paper-mountains`,
    ]) {
      const response = await request(app).patch(path).send({ quantity: 1 });
      expect(response.status).toBe(404);
      expect(response.type).toBe("application/json");
      expect(response.body).toEqual({ error: expect.any(String) });
    }
    expect((await load()).body).toEqual(before);
  });
});

describe("cart line removal", () => {
  it("returns 204 with no body and preserves other lines, carts and catalogue", async () => {
    const catalogue = (await request(app).get("/api/books")).body;
    const other = (await request(app).post("/api/carts")).body;
    await request(app)
      .post(`/api/carts/${cartId}/items`)
      .send({ bookId: "paper-mountains", quantity: 1 });
    const response = await remove();
    expect(response.status).toBe(204);
    expect(response.text).toBe("");
    expect((await load()).body).toEqual({
      cartId,
      items: [
        {
          bookId: "paper-mountains",
          title: "The Cartographers",
          unitPrice: 13.49,
          quantity: 1,
          lineTotal: 13.49,
        },
      ],
      total: 13.49,
    });
    expect((await request(app).get("/api/books")).body).toEqual(catalogue);
    expect((await request(app).get(`/api/carts/${other.cartId}`)).body).toEqual(other);
  });

  it("removes the final line to restore an empty zero cart", async () => {
    const response = await remove();
    expect(response.status).toBe(204);
    expect(response.text).toBe("");
    expect((await load()).body).toEqual({ cartId, items: [], total: 0 });
    const again = await remove();
    expect(again.status).toBe(404);
    expect(again.body).toEqual({ error: expect.any(String) });
    expect((await load()).body).toEqual({ cartId, items: [], total: 0 });
  });

  it("returns JSON 404 without mutation for missing carts, books and lines", async () => {
    const before = (await load()).body;
    for (const path of [
      `/api/carts/missing/items/${bookId}`,
      `/api/carts/${cartId}/items/missing`,
      `/api/carts/${cartId}/items/paper-mountains`,
    ]) {
      const response = await request(app).delete(path);
      expect(response.status).toBe(404);
      expect(response.type).toBe("application/json");
      expect(response.body).toEqual({ error: expect.any(String) });
    }
    expect((await load()).body).toEqual(before);
  });
});
