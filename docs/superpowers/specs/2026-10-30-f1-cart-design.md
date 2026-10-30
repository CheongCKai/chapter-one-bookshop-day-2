# F1 design — Build and edit a Cart

Traces to: F1 in `docs/intent.md` (approved at commit `892b303`)

Status: Draft  
Date: 2026-10-30  
Feature branch: `feat/f1-cart`  
Spec approval: Awaiting gate 1 review  
Spec approver: Not yet recorded  
Spec approval date: Not yet recorded

## Purpose and scope

A shopper can collect multiple Books in one Cart, see one Line item per Book,
change quantities, and remove Books. The Cart explains any requested quantity
above current Stock before checkout. F1 creates no Order, takes no payment,
creates no account, and provides no checkout action. Cart operations do not
reserve or decrement Stock. The Store remains in memory and resets on server
restart.

## Done when

1. A shopper can add at least two different Books and see both Line items with
   their quantities in the Cart.
2. A shopper can set a Line item to a positive whole-number quantity and see
   that exact quantity after the update; they can remove a Book and see it
   disappear. Removing the last Book shows an empty Cart state.
3. Adding a Book already in the Cart asks the shopper to confirm an increase
   from the current quantity to the next quantity. Cancel leaves the quantity
   unchanged. Confirm increases it by one and visibly updates the **same**
   Line item; no duplicate row appears.
4. If any requested quantity exceeds current Stock, that Line item shows the
   requested and available quantities and tells the shopper to reduce it
   before checkout. The warning clears when the quantity is corrected. A
   shopper can still save an over-Stock quantity in F1; checkout will make the
   final Stock decision in F2.
5. A returned `cartId` lets the browser reopen the Cart after a page reload
   while the server process remains running. After a server restart, an old
   `cartId` produces an explained empty state and the shopper can start a new
   Cart.
6. Invalid input and missing Cart, Book, or Line item requests return the
   specified JSON errors without changing Cart contents. Cart creation,
   editing, and removal never change Stock.

## Design choices

- **One Line item per Book ID.** A Map or equivalent within the Store keeps
  `{ bookId, quantity }` for each Cart. This makes duplicate rows impossible.
- **Absolute quantity API.** The client sets a Line item's quantity with
  `PUT`, whether creating or editing it. An additive API would make accidental
  repeat submissions harder to distinguish from intentional ones. The
  shopper's confirmed repeated Add is implemented by reading the current
  quantity, then setting it to that quantity plus one.
- **Confirm before a repeated Add.** The approved F1 choice is to ask before
  increasing quantity. The confirmation names the Book and states both the
  current and proposed quantity. A native confirmation dialog fits the small
  vanilla-JS frontend; Cancel makes no write and shows a short unchanged-Cart
  message. Confirm writes the proposed quantity and refreshes the Cart view.
- **Allow an over-Stock request, then explain it.** This follows F1's requirement
  that shoppers can see and correct a requested quantity that exceeds Stock.
  It is not a promise of availability. F2 must verify Stock at checkout.
- **Remember only the identifier in the browser.** `localStorage` holds the
  returned `cartId` so reloads can fetch the Cart. The server has no session,
  cookie, account, or persistent Cart. An unguessable UUID identifies a Cart;
  possession of the ID is sufficient to access it within this teaching app.

## Architecture and data flow

`src/store.ts` owns Cart state alongside Books. `reset()` clears all Carts and
restores the seeded Catalogue. The Store generates a `cartId` with Node's
built-in `crypto.randomUUID()`, stores only Book IDs and quantities, and returns
defensive copies. When a Cart is read, its response uses current Book details
and current Stock from the Store, so a later Stock change is reflected without
rewriting Line items. Routes do not read or mutate module-level arrays or the
Seed.

`src/routes/carts.ts` validates HTTP input, calls the Store, and projects the
Cart response. `src/app.ts` mounts that router before the static storefront
and `/api` fallback. All API errors, including malformed JSON, use
`{ "error": "message" }` with the status below.

The frontend extends `public/index.html` with a Cart navigation entry and a
Cart view. A shopper opens a Book detail and chooses Add to Cart. On the first
Add, the browser creates an empty Cart, saves the returned `cartId`, then sets
the Book's Line item quantity to one. On a later Add, it fetches the current
Cart. If the Book is absent, it sets quantity one. If present, it asks for
confirmation before setting quantity to the current quantity plus one.
Repeated clicks are disabled while that operation is pending. All successful
mutations use the returned Cart or reload it, then show a clear result.

The Cart view shows each Book's title, author, unit price, quantity, a labelled
whole-number quantity input with a Save action, and a Remove action. It shows
an empty-state message when there are no Line items. For a Line item where
`quantity > book.stock`, it displays a visible warning such as “Requested 4;
only 3 currently in Stock. Reduce the quantity before checkout.” The warning
is text, not colour alone. No checkout button or amount-due claim is added in
F1; those belong to F2. New render helpers in `public/app.js` stay pure and
exported, with matching declarations in `public/app.d.ts`. Dynamic text is
escaped before it enters HTML. Fetch failures and validation errors appear in
the view without hiding the existing Cart. Styling stays in
`public/styles.css`.

On page load, if `localStorage` contains a `cartId`, the frontend tries to
fetch it. A `404` means the in-memory Cart no longer exists: clear the stored
ID and show an empty Cart message that explains the server reset. Other
network or server errors retain the ID and offer a retry. If browser storage
is unavailable, the Cart works for the current page lifetime and explains
that a reload cannot restore it.

## API contract

All paths are same-origin JSON endpoints. A Cart response has this shape:

```json
{
  "cartId": "uuid-string",
  "items": [
    {
      "book": {
        "id": "paper-mountains",
        "title": "The Cartographers",
        "author": "Peng Shepherd",
        "price": 13.49,
        "stock": 3,
        "coverImage": "covers/paper-mountains.jpg"
      },
      "quantity": 4,
      "exceedsStock": true
    }
  ]
}
```

`items` contains at most one entry per Book ID, in first-added order.
`exceedsStock` is `quantity > book.stock`, calculated from current Store
Stock on every response. Empty Carts return `items: []`. A Cart response does
not contain an Order, checkout state, reservation, or total due.

| Operation        | Request                                                         | Success                                                                                   | Errors                                                  |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Create Cart      | `POST /api/carts` with no body or `{}`                          | `201` Cart response with a new `cartId` and empty `items`                                 | `400` for a nonempty or invalid body                    |
| Read Cart        | `GET /api/carts/:cartId`                                        | `200` Cart response                                                                       | `404` unknown Cart                                      |
| Set Line item    | `PUT /api/carts/:cartId/items/:bookId` with `{ "quantity": 2 }` | `201` Cart response when the Line item is new; `200` Cart response when it already exists | `400` invalid body/quantity; `404` unknown Cart or Book |
| Remove Line item | `DELETE /api/carts/:cartId/items/:bookId`                       | `204` with no body                                                                        | `404` unknown Cart or Line item                         |

`quantity` must be a JSON number that is a positive safe integer. Strings,
fractions, zero, negatives, booleans, and extra body fields are rejected with
`400`. The `PUT` value replaces the existing quantity; it never increments
implicitly. The client therefore performs a confirmed repeated Add by reading
the current quantity and sending one `PUT` for `quantity + 1`. A requested
quantity above Stock is valid and appears with `exceedsStock: true`; it does
not alter Stock. If an increment would exceed the safe-integer limit, the
request is rejected before any write. Malformed JSON returns `400` JSON.
Unknown Cart, Book, and Line item paths return `404` JSON. Example error:
`{ "error": "Cart not found" }`. No Cart API response relies on cookies or
server sessions.

## Errors and recovery

- The browser validates the quantity input before sending it, retains the
  previous visible value on failure, and displays the API error. The server
  remains authoritative for validation.
- A failed first Add may leave an empty Cart after `POST` succeeds and `PUT`
  fails. The browser retains its `cartId`, shows the failure, and allows retry.
- A stale `cartId` after restart is cleared only on a `404`; temporary network
  failure does not discard a potentially valid Cart.
- A repeated Add cancelled in the confirmation dialog performs no `PUT` and
  leaves the existing Line item unchanged.

## Verification

Use Supertest against `createApp()` with `store.reset()` before mutating tests.
Exercise Cart creation and returned ID, two different Books, repeated writes
to one Book producing one Line item, absolute quantity replacement, removal
including the last item, over-Stock warnings in the response, unchanged Stock,
invalid quantities, missing resources, malformed JSON, and reset invalidating
old IDs. Test pure frontend render helpers for multiple Line items, empty
state, escaped Book text, and the requested-versus-available warning. Manually
exercise the browser confirmation path: Cancel preserves quantity, Confirm
updates the single row, and stale-ID recovery explains the reset. Required
eventual repository checks are `npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`, and `npm audit --audit-level=high`.

## Open product questions

None for F1. Questions about collection charges and owner Order handling in
`docs/intent.md` remain with F2 and do not affect this Cart design.
