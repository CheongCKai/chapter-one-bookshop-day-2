import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { store } from "../src/store.js";

const app = createApp();

beforeEach(() => {
  store.reset();
});

describe("create and get a cart", () => {
  it("creates an empty cart and retrieves it by its nonempty ID", async () => {
    const created = await request(app).post("/api/carts");
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ cartId: expect.any(String), items: [], total: 0 });
    expect(created.body.cartId.length).toBeGreaterThan(0);

    const loaded = await request(app).get(`/api/carts/${created.body.cartId}`);
    expect(loaded.status).toBe(200);
    expect(loaded.body).toEqual(created.body);
  });

  it("creates separate carts with distinct IDs", async () => {
    const first = await request(app).post("/api/carts");
    const second = await request(app).post("/api/carts");
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.cartId).not.toBe(second.body.cartId);
    expect((await request(app).get(`/api/carts/${first.body.cartId}`)).body).toEqual(first.body);
  });

  it("returns JSON 404 for an unknown cart", async () => {
    const response = await request(app).get("/api/carts/unknown");
    expect(response.status).toBe(404);
    expect(response.type).toBe("application/json");
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it("clears carts on reset without changing the catalogue", async () => {
    const before = await request(app).get("/api/books");
    const created = await request(app).post("/api/carts");
    expect(created.status).toBe(201);
    store.reset();
    const loaded = await request(app).get(`/api/carts/${created.body.cartId}`);
    expect(loaded.status).toBe(404);
    expect((await request(app).get("/api/books")).body).toEqual(before.body);
  });
});
