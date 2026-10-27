# Cart + Checkout Design — Chapter One Bookshop

**Date:** 2026-08-12
**Status:** Approved

## Summary

Add cart and checkout to the bookshop: shoppers can create a cart, add/update/remove books, and check out to receive an order summary. No auth, no sessions, no database — all state is in-memory, consistent with the existing architecture.

## Decisions

| Decision              | Choice                                            | Rationale                                                 |
| --------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| Checkout outcome      | Returns `Order` (id, items, total); destroys cart | Gives the frontend something to display                   |
| Stock validation      | Checkout only                                     | Simpler; adding never blocks the shopper                  |
| Scope                 | Full stack (API + frontend)                       | Teaching goal is the full vertical slice                  |
| `cartId` persistence  | In-memory JS variable (lost on refresh)           | No localStorage needed; acceptable for a teaching project |
| Implementation phases | Two phases: API first, then frontend              | Green tests before touching the browser                   |

## Data Model

New types added to `src/types.ts`:

```ts
interface LineItem {
  bookId: string;
  quantity: number;
  unitPrice: number; // snapshot of Book.price at time of add
}

interface Cart {
  id: string; // UUID
  items: LineItem[];
}

interface Order {
  id: string; // UUID
  items: LineItem[];
  total: number; // sum of unitPrice * quantity across all items
}
```

## API Routes

New file `src/routes/cart.ts`, mounted in `src/app.ts`.

| Method   | Path                               | Success     | Notes                                                                                                                                                   |
| -------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/carts`                       | `201 Cart`  | Creates an empty cart                                                                                                                                   |
| `GET`    | `/api/carts/:cartId`               | `200 Cart`  | Returns current cart state                                                                                                                              |
| `PUT`    | `/api/carts/:cartId/items/:bookId` | `200 Cart`  | Body: `{ quantity: number }`. Upserts line item. Quantity `0` is rejected (use DELETE to remove). `unitPrice` is snapshotted from the book at add time. |
| `DELETE` | `/api/carts/:cartId/items/:bookId` | `200 Cart`  | Removes the line item                                                                                                                                   |
| `POST`   | `/api/carts/:cartId/checkout`      | `200 Order` | Validates stock, deducts stock, returns Order, destroys cart                                                                                            |

## Store Extensions (`src/store.ts`)

- `createCart(): Cart` — generates a UUID, stores an empty cart, returns it
- `getCart(cartId: string): Cart | undefined`
- `setItem(cartId: string, bookId: string, quantity: number): Cart` — upserts the line item; snapshots `unitPrice` from the book on add
- `removeItem(cartId: string, bookId: string): Cart` — removes the line item
- `checkout(cartId: string): Order` — validates every line item against current stock, deducts stock for each, computes total, deletes the cart, returns an Order with a new UUID

## Error Handling

All errors follow the existing `{ "error": "..." }` shape.

| Condition                         | Status | Message                                 |
| --------------------------------- | ------ | --------------------------------------- |
| Unknown `cartId`                  | 404    | `"Cart not found"`                      |
| Unknown `bookId` on add/update    | 404    | `"Book not found"`                      |
| `quantity` not a positive integer | 400    | `"quantity must be a positive integer"` |
| Checkout on empty cart            | 400    | `"Cart is empty"`                       |
| Insufficient stock at checkout    | 409    | `"Insufficient stock for: <title>"`     |

## Frontend UI

All changes within existing files (`public/app.js`, `public/index.html`, `public/styles.css`). No new files, no new dependencies.

**Book detail view:**

- "Add to cart" button
- On first add: `POST /api/carts` to create cart; store returned `id` in module-level `cartId` variable
- On subsequent adds: fetch current cart, increment quantity, then `PUT /api/carts/:cartId/items/:bookId`
- Cart badge (item count) in the nav bar updates after every mutation

**Cart view (toggled section in `index.html`):**

- Lists each line item: title, unit price, quantity, line total
- `−` / `+` buttons adjust quantity (minimum 1); "Remove" deletes the item
- Running grand total at bottom
- "Checkout" button calls `POST /api/carts/:cartId/checkout`

**Order confirmation (replaces cart view on success):**

- Shows order ID, item list, grand total
- Clears the in-memory `cartId`

## Testing

**`tests/cart.test.ts` (new):**

- Happy path: create → add → get → update qty → checkout → order has correct total; stock decremented
- Remove item: add two books, delete one, cart contains one item
- 404 on unknown cart
- 404 on unknown book
- 400 on invalid quantity (`0`, negative, non-integer)
- 409 when checkout quantity exceeds stock
- 400 on empty cart checkout

**`tests/render.test.ts` (extended):**

- Cart badge renders correct item count
- Cart item row renders title, price, quantity, line total
- Order confirmation renders order ID and grand total

## Implementation Phases

**Phase 1 — API (backend + tests green before any frontend work):**

1. Add `LineItem`, `Cart`, `Order` to `src/types.ts`
2. Extend `src/store.ts` with cart/checkout methods
3. Create `src/routes/cart.ts` with all five routes
4. Mount cart router in `src/app.ts`
5. Write `tests/cart.test.ts`; all tests must pass

**Phase 2 — Frontend:**

1. Add cart HTML sections to `public/index.html`
2. Add cart logic to `public/app.js`
3. Add cart styles to `public/styles.css`
4. Extend `tests/render.test.ts` with cart/order render tests
