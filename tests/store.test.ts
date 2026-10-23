import { beforeEach, expect, it } from "vitest";
import { store } from "../src/store.js";

beforeEach(() => store.reset());
it("returns independent snapshots so callers cannot alter stored cart data", () => {
  const created = store.createCart();
  const added = store.addCartItem(created.cartId, "the-lantern-sea", 2);
  added.items[0]!.quantity = 99;
  added.items[0]!.title = "Changed";
  added.total = 0;
  const loaded = store.getCart(created.cartId)!;
  expect(loaded.items[0]).toMatchObject({
    quantity: 2,
    title: "The Light Between Oceans",
    lineTotal: 29.98,
  });
  expect(loaded.total).toBe(29.98);
  loaded.items.length = 0;
  expect(store.getCart(created.cartId)!.items).toHaveLength(1);
});
