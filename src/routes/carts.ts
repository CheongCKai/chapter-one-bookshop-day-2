import { Router } from "express";
import { store } from "../store.js";

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
