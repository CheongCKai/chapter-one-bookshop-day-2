# F1 — Cart management

Traces to: F1 in `docs/intent.md`, sourced from FB-01, FB-02, FB-04,
FB-05, FB-10, ON-01 and ON-03 in `docs/inputs/shopper-feedback.md`.

Version: rehearsal-v1 (2026-10-23)
Status: Draft for classroom review; authorized rehearsal fixture
Approval: Simulated Gate 1 for backup preparation only. The instructor explicitly
authorized complete rehearsal checkpoints in chat on 2026-10-23. This does not
record a real class vote, production approval, or approval of a later revision.

## Scope

Create an in-memory cart, add and merge book quantities, update and remove
lines, and use those operations through the existing storefront. Show visible
quantities, line totals and the grand total before ordering.

Excluded: checkout, orders, stock reservation or deduction, payment, accounts,
authentication, sessions, persistent browser storage, database, search, gift
wrapping, the low-stock cue and new dependencies. Cart contents disappear when
the process restarts; a page reload starts a new cart. Existing catalogue,
book-detail and About navigation continue to work.

## Approaches considered

1. **One server-side cart identified by an opaque ID (selected).** Fits the
   existing route/store architecture and teaches a vertical route-to-store slice.
   The browser retains only the ID for the current page session.
2. Browser-only cart. Fewer API changes, but does not demonstrate the planned
   backend phases and duplicates business validation in the client.
3. Persistent account/session cart. Useful in a larger product but outside the
   project's explicit architecture and classroom scope.

## Rehearsal product decisions

These choices are explicit preparation assumptions, not facts implied by the
raw feedback. Reconfirm them during the live class before real gate approval.

- Adding the same book again increases its quantity in one existing line.
- Quantities are positive safe integers; strings, fractions, zero, negative
  numbers, missing values, null, booleans and unsafe integers are invalid.
- Add validates the combined quantity; update replaces the quantity. Either
  operation rejects a quantity above current catalogue stock without mutation.
- Zero does not mean remove. Removal is a separate explicit action.
- Stock is neither reserved nor deducted. F2 must revalidate it at checkout.
- Display currency uses the existing dollar format. Compute each unit price in
  integer cents, multiply by quantity, sum cents, then expose dollar values.
- Cart IDs are random opaque UUIDs. They identify an in-memory resource, not an
  authenticated user. No cart discovery/list endpoint is introduced.

## Architecture and interfaces

Keep `src/app.ts` listener-free. Mount a cart router from `src/routes/carts.ts`.
The store in `src/store.ts` owns all cart state and returns defensive snapshots;
`store.reset()` also removes carts. Types live in `src/types.ts`.

Each successful cart JSON response has this shape:

```json
{
  "cartId": "opaque-uuid",
  "items": [
    {
      "bookId": "the-lantern-sea",
      "title": "The Light Between Oceans",
      "unitPrice": 14.99,
      "quantity": 2,
      "lineTotal": 29.98
    }
  ],
  "total": 29.98
}
```

The empty shape is `{ "cartId": "opaque-uuid", "items": [], "total": 0 }`.
Prices and titles come from the catalogue, never request bodies.

| Method | Path                               | Input                                 | Success                  |
| ------ | ---------------------------------- | ------------------------------------- | ------------------------ |
| POST   | `/api/carts`                       | No body required                      | 201, new empty cart JSON |
| GET    | `/api/carts/:cartId`               | None                                  | 200, cart JSON           |
| POST   | `/api/carts/:cartId/items`         | `{ "bookId": "slug", "quantity": 1 }` | 200, updated cart JSON   |
| PATCH  | `/api/carts/:cartId/items/:bookId` | `{ "quantity": 2 }`                   | 200, updated cart JSON   |
| DELETE | `/api/carts/:cartId/items/:bookId` | None                                  | 204, no body             |

All errors return JSON `{ "error": "message" }`. Missing carts, books or cart
lines return 404. Malformed JSON, invalid body shape, blank/non-string book ID,
invalid quantities and over-stock operations return 400. Validate request shape
and quantity at the route boundary before store mutation. After shape validation,
resolve the cart, book and line in that order where applicable. Unknown extra
body fields are ignored and cannot override catalogue data. A failed operation
leaves all carts, books and totals unchanged.

## Storefront

Keep all styling in `public/styles.css`, all application behavior in the existing
`public/app.js`, and markup in `public/index.html`. No framework or build step.

Cards and detail views offer an Add to cart button for available books (quantity
one per click); unavailable books disable it. A Cart navigation entry opens the
current cart. Create the cart lazily before its first use, retain the ID only in
module memory, and reuse it for subsequent requests on that page. The cart view
shows an empty-cart message or line titles, unit prices, editable quantities,
line totals, Remove buttons and the grand total. Update is an explicit button,
so editing a field does not silently mutate a cart. Provide a route back to the
catalogue. Do not add a checkout button for an unimplemented capability.

Export a pure `cartHTML(cart)` rendering helper, using the existing `escapeHtml`
and `formatPrice` helpers. Escape IDs, titles and any dynamic attribute values.
Use a dedicated status element with `role="status"` for success and failure
messages; set message text with `textContent`. Handle non-OK HTTP responses and
network errors visibly, retain the last confirmed cart, and restore enabled
controls after requests finish. Serialize cart mutations or disable mutation
controls while one request is pending so rapid clicks cannot create two carts.
If a restart invalidates the cart ID, report the missing cart and offer a clear
way to start a new empty cart rather than silently claiming the old items remain.

## Done when

1. Creating two carts yields distinct nonempty IDs, empty item arrays and zero
   totals; GET returns the same contents and cart identity for each.
2. An unknown cart ID returns 404 JSON; existing catalogue endpoints retain
   their behavior and all original tests remain intact.
3. Adding an available book with quantity two returns one line with the
   catalogue title, unit price, quantity two and correct totals.
4. Adding the same book twice produces one line with the combined quantity;
   adding a different book creates another line and recomputes the total.
5. Invalid quantities (including zero, negative, fractional, string, missing,
   null, boolean and unsafe integers) return 400 and do not mutate the cart.
6. An unknown book returns 404; invalid book ID/body shapes and malformed JSON
   return 400 JSON. Failed requests do not mutate the cart or catalogue.
7. Additions whose combined quantity exceeds stock return 400; exactly the
   available stock succeeds, and catalogue stock remains unchanged.
8. PATCH replaces an existing line quantity and recalculates totals. Unknown
   lines return 404; invalid and over-stock updates return 400 without mutation.
9. DELETE removes an existing line with 204 and no response body. Deleting an
   absent line returns 404; removing the final line restores an empty zero cart.
10. Cart IDs isolate shoppers' contents; returned snapshots cannot modify stored
    state; `store.reset()` clears all carts without mutating seeded books.
11. Line and grand totals use cent-based arithmetic and show two decimal places
    in the UI; client-supplied titles or prices cannot change catalogue values.
12. Storefront cards/details can add books, and Cart displays current quantities,
    totals and an empty state. Updates and removals refresh the visible cart.
13. Rendered dynamic data is escaped. Cart failures are visible, pending actions
    are serialized, and unavailable books cannot be added through the UI.
14. No checkout, stock deduction, accounts, persistence, dependency, framework,
    stylesheet or build-tool addition is introduced. Existing navigation works.

## Four-phase implementation boundary

1. Create and get a cart: types, store, router, mounting and API tests form the
   smallest route-to-store vertical slice (criteria 1, 2 and relevant 10).
2. Add and merge items: route validation, stock checks, cents arithmetic and
   behavioral API tests (criteria 3–7, relevant 10–11).
3. Update and remove: PATCH/DELETE and API tests including failed mutations
   (criteria 8–11).
4. Storefront cart UI: pure render tests and browser interaction verification
   (criteria 12–14 plus integration with earlier criteria).

## Validation and evidence

Every phase runs `npm test`, `npm run typecheck` and `npm run lint` after a
recorded RED-to-GREEN cycle for its new behavior. Preserve exact failed-test
output and subsequent successful output; a synthetic example is labelled as
such and never presented as a real run. A separate reviewer examines the whole
phase diff and acceptance coverage. Final review additionally runs
`npm run format:check` and `npm audit --audit-level=high`.

The baseline audit currently fails with five development dependency findings
(two moderate, three high). Report that failure explicitly; do not suppress it,
weaken CI, or claim final `VERDICT: READY` while a required check fails. A working
rehearsal checkpoint can still demonstrate the feature with this known blocker.
GitHub CI, issue approval and Copilot platform behavior require separate actual
platform evidence; local checks cannot substitute for them.

## Open questions

None for this authorized rehearsal version. During class, the simulated
choices above remain subject to the class vote and can invalidate subsequent
checkpoints if changed. Approval of this fixture is not approval to merge F1.
