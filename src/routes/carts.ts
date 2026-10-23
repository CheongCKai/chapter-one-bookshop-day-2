import { Router } from "express";
import { CartError, store } from "../store.js";

export const cartsRouter = Router();

cartsRouter.post("/api/carts", (_req, res) => {
  res.status(201).json(store.createCart());
});

cartsRouter.get("/api/carts/:cartId", (req, res) => {
  const cart = store.getCart(req.params.cartId);
  if (!cart) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }
  res.json(cart);
});

function validBody(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

function validQuantity(quantity: unknown): quantity is number {
  return typeof quantity === "number" && Number.isSafeInteger(quantity) && quantity > 0;
}

cartsRouter.post("/api/carts/:cartId/items", (req, res) => {
  const body: unknown = req.body;
  if (
    !validBody(body) ||
    typeof body.bookId !== "string" ||
    !body.bookId.trim() ||
    !validQuantity(body.quantity)
  ) {
    throw new CartError(400, "A bookId and positive integer quantity are required");
  }
  res.json(store.addCartItem(req.params.cartId, body.bookId, body.quantity));
});
