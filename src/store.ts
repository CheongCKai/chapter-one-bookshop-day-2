import { randomUUID } from "node:crypto";
import type { Book, Cart } from "./types.js";
import { SEED_BOOKS } from "./data/seed.js";

/**
 * A tiny in-memory data store. There is no database (see docs/adr/0001).
 * State lives only for the life of the process — restarting the server resets
 * everything back to the seed. That is a deliberate teaching choice, not a bug.
 */
export class CartError extends Error {
  constructor(
    public readonly status: 400 | 404,
    message: string,
  ) {
    super(message);
  }
}

class Store {
  private books: Book[] = [];
  private carts = new Map<string, Cart>();

  constructor() {
    this.reset();
  }

  /** Restore the catalogue to its seeded state. Used by tests and on startup. */
  reset(): void {
    // Deep copy so callers can never mutate the seed by reference.
    this.books = SEED_BOOKS.map((b) => ({ ...b }));
    this.carts.clear();
  }

  createCart(): Cart {
    const cart: Cart = { cartId: randomUUID(), items: [], total: 0 };
    this.carts.set(cart.cartId, cart);
    return this.copyCart(cart);
  }

  getCart(cartId: string): Cart | undefined {
    const cart = this.carts.get(cartId);
    return cart ? this.copyCart(cart) : undefined;
  }

  addCartItem(cartId: string, bookId: string, quantity: number): Cart {
    const cart = this.carts.get(cartId);
    if (!cart) throw new CartError(404, "Cart not found");
    const book = this.getBook(bookId);
    if (!book) throw new CartError(404, "Book not found");
    const existing = cart.items.find((item) => item.bookId === bookId);
    const combined = (existing?.quantity ?? 0) + quantity;
    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      !Number.isSafeInteger(combined) ||
      combined > book.stock
    ) {
      throw new CartError(400, "Quantity must be a positive integer within available stock");
    }
    if (existing) {
      existing.quantity = combined;
      existing.lineTotal = (Math.round(existing.unitPrice * 100) * combined) / 100;
    } else {
      cart.items.push({
        bookId,
        title: book.title,
        unitPrice: book.price,
        quantity,
        lineTotal: (Math.round(book.price * 100) * quantity) / 100,
      });
    }
    this.updateCartTotal(cart);
    return this.copyCart(cart);
  }

  updateCartItem(cartId: string, bookId: string, quantity: number): Cart {
    const { cart, book, item } = this.requireCartItem(cartId, bookId);
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > book.stock) {
      throw new CartError(400, "Quantity must be a positive integer within available stock");
    }
    item.quantity = quantity;
    item.lineTotal = (Math.round(item.unitPrice * 100) * quantity) / 100;
    this.updateCartTotal(cart);
    return this.copyCart(cart);
  }

  removeCartItem(cartId: string, bookId: string): void {
    const { cart, item } = this.requireCartItem(cartId, bookId);
    cart.items.splice(cart.items.indexOf(item), 1);
    this.updateCartTotal(cart);
  }

  private requireCartItem(cartId: string, bookId: string) {
    const cart = this.carts.get(cartId);
    if (!cart) throw new CartError(404, "Cart not found");
    const book = this.getBook(bookId);
    if (!book) throw new CartError(404, "Book not found");
    const item = cart.items.find((line) => line.bookId === bookId);
    if (!item) throw new CartError(404, "Cart item not found");
    return { cart, book, item };
  }

  private updateCartTotal(cart: Cart): void {
    cart.total =
      cart.items.reduce((cents, item) => cents + Math.round(item.lineTotal * 100), 0) / 100;
  }

  private copyCart(cart: Cart): Cart {
    return { ...cart, items: cart.items.map((item) => ({ ...item })) };
  }

  listBooks(): Book[] {
    return this.books.map((b) => ({ ...b }));
  }

  getBook(id: string): Book | undefined {
    const found = this.books.find((b) => b.id === id);
    return found ? { ...found } : undefined;
  }
}

export const store = new Store();
