# Intent — self-service book orders

Status: Approved  
Date: 2026-10-30  
Approved by: Requesting user (this conversation)  
Approval date: 2026-10-30  
Approval evidence: "i approve this version of intent.md."  
Sources: `docs/inputs/shopper-feedback.md` (FB-01–FB-10, ON-01–ON-05); `AGENTS.md`; `docs/glossary.md`; `docs/adr/0001-in-memory-store.md`

## Problem

Shoppers can browse the Catalogue but must email the owner to buy Books. Email
threads make multi-book requests, quantities, availability, and confirmation
unclear. The owner spends time handling each sale and has promised Books that
were out of Stock. These are reported problems, not measured conversion or
time-saving estimates. [FB-01–FB-07, FB-10, ON-01, ON-03]

## Pain points

| ID  | Pain point                                                                     | Evidence                 |
| --- | ------------------------------------------------------------------------------ | ------------------------ |
| P1  | Shoppers cannot place an order on the site; the owner handles sales by email.  | FB-01, ON-01             |
| P2  | Multi-book requests and quantity changes are error-prone.                      | FB-02, FB-04, FB-10      |
| P3  | Shoppers learn too late that a Book is unavailable; low Stock is easy to miss. | FB-03, FB-06, ON-03      |
| P4  | Shoppers cannot see the full amount due before committing.                     | FB-05                    |
| P5  | Shoppers do not receive clear confirmation or a record of what they ordered.   | FB-07                    |
| P6  | Shoppers cannot find a Book when they remember only its author.                | FB-08                    |
| P7  | Some shoppers want gift wrapping and a note.                                   | FB-09; deferred by ON-05 |

## Desired outcomes

- A shopper can select multiple Books, review and correct quantities, and place
  an order without an email exchange. [FB-01, FB-02, FB-04, FB-10, ON-01]
- A shopper sees the full amount due before placing an order and receives a
  clear confirmation afterward. [FB-05, FB-07]
- Shoppers can recognize low or unavailable Stock, and an order cannot promise
  more copies than are available. [FB-03, FB-06, ON-03]
- A shopper can find Books by author. [FB-08]

## Constraints

- Payment is on collection; online card payment is outside this release.
  [ON-02]
- Shoppers do not need customer accounts. [ON-04]
- Stock must never fall below zero. [ON-03]
- The Store is in memory and resets on server restart; orders and carts in this
  teaching project are not durable across restarts. [AGENTS.md;
  docs/adr/0001-in-memory-store.md]
- Keep delivery within the existing Express, vanilla JavaScript, one-process
  architecture and without new dependencies. [AGENTS.md]

## Features

Priorities below are **proposed for approval**, based on the owner saying that
buying comes before gift wrapping and on the reported Stock mistakes. They are
not a separate stakeholder decision. [ON-01, ON-03, ON-05]

| ID  | Feature                  | Solves         | Proposed priority |
| --- | ------------------------ | -------------- | ----------------- |
| F1  | Build and edit a Cart    | P1, P2         | Now               |
| F2  | Place a collection Order | P1, P3, P4, P5 | Now               |
| F3  | Show Stock status        | P3             | Next              |
| F4  | Search by author         | P6             | Later             |

### F1 — Build and edit a Cart

- **User value:** A shopper can assemble a multi-Book purchase and correct it
  before committing. [FB-02, FB-04, FB-10]
- **Done when:**
  - A shopper can add more than one Book to a Cart and see each Line item and
    quantity.
  - A shopper can change a Line item quantity or remove a Book before checkout.
  - Adding the same Book again does not create a second, ambiguous Line item;
    the resulting quantity is visible.
  - The Cart clearly shows when a requested quantity exceeds available Stock
    so the shopper can correct it before checkout.
- **Not in this feature:** Placing an Order, taking payment, or customer accounts.

### F2 — Place a collection Order

- **User value:** A shopper can commit to a purchase, know what to pay on
  collection, and see that the Order was received. The owner avoids promising
  unavailable Stock. [FB-01, FB-03, FB-05, FB-07, ON-01–ON-04]
- **Done when:**
  - Before placing an Order, the shopper sees every Line item, quantity, and
    the full amount due on collection, with any applicable charges visible.
  - A shopper can place an Order without an account or online card payment.
  - Checkout verifies current Stock for every Line item. If any quantity is
    unavailable, the shopper is told what needs correction and no Order is
    placed. A successful Order never takes Stock below zero.
  - A successful checkout creates an Order record and shows confirmation with
    its reference, Books, quantities, amount due, and payment-on-collection
    instruction.
- **Not in this feature:** Online payment, delivery, gift services, or durable
  storage across restarts.

### F3 — Show Stock status

- **User value:** A shopper can judge availability before building a Cart.
  [FB-03, FB-06]
- **Done when:**
  - Catalogue and Book details show when a Book is out of Stock.
  - A Book with low Stock (three or fewer copies) has a conspicuous indication
    of its remaining quantity.
  - Availability shown to shoppers reflects the current Store Stock after a
    successful Order.
- **Not in this feature:** Reserving Stock or replacing the final Stock check
  at checkout.

### F4 — Search by author

- **User value:** A shopper who knows an author but not a title can find the
  relevant Books. [FB-08]
- **Done when:** A shopper can search the Catalogue by author and open a
  matching Book; a search with no matches is explained clearly.
- **Not in this feature:** Broader search or recommendation features.

## Out of scope

- Gift wrapping and gift notes are deferred until basic ordering works.
  [FB-09, ON-05]
- Customer accounts and online card payment. [ON-02, ON-04]
- Persistent carts, Orders, or Stock across server restarts. [AGENTS.md;
  docs/adr/0001-in-memory-store.md]

## Open questions

1. Is collection the only fulfillment option for this release, and are there
   any charges beyond Book prices that must appear in the amount due? [FB-05,
   ON-02]
2. How should the owner receive or review new Orders within the project's
   no-account, in-memory scope? The feedback establishes the need to reduce
   email handling but does not define that workflow. [ON-01, ON-04; AGENTS.md]
