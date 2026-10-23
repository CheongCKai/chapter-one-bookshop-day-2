# Intent — online bookshop rehearsal

Status: Approved for rehearsal only — simulated class approval
Authorization: Instructor requested complete rehearsal checkpoints in this chat; no real class vote recorded.
Date: 2026-10-23
Sources: docs/inputs/shopper-feedback.md

## Problem

Shoppers cannot assemble and confirm an order online. Email ordering loses
items, obscures totals and stock, and gives shoppers no reliable confirmation.

## Pain points

| ID  | Pain point                                            | Evidence                          |
| --- | ----------------------------------------------------- | --------------------------------- |
| P1  | No reliable way to assemble and revise a purchase     | FB-01, FB-02, FB-04, FB-10, ON-01 |
| P2  | Availability and low-stock information are inadequate | FB-03, FB-06, ON-03               |
| P3  | Shoppers lack a total and confirmation                | FB-05, FB-07                      |

## Desired outcomes

- Assemble multiple books and visibly revise quantities before ordering.
- See availability, line items and totals before committing.
- Receive an order confirmation without accounts or card payment.

## Constraints

Keep the existing in-memory Express and vanilla-JS architecture. No new
dependencies, database, accounts, authentication or payment provider. Stock must
never go below zero (ON-03). Pay on collection is acceptable (ON-02).

## Features

| ID  | Feature                         | Solves     | Priority                                |
| --- | ------------------------------- | ---------- | --------------------------------------- |
| F1  | Cart management                 | P1, P2, P3 | Proposed first, matching the Day 2 deck |
| F2  | Checkout and order confirmation | P2, P3     | Proposed after F1                       |
| F3  | Low-stock cue                   | P2         | Independent small issue for Module 6    |

### F1 — Cart management

User value: shoppers can collect several books and correct their intended
purchase before ordering.

Done when:

1. Shoppers can add an available book and see the cart contents.
2. Shoppers can change quantities and remove a line.
3. Repeated additions are handled explicitly with visible final quantities.
4. The cart shows line totals and a grand total.
5. Invalid quantities and quantities above available stock are rejected.

Not in this feature: checkout, stock deduction, orders, accounts or payment.

### F2 — Checkout and order confirmation

Done when a nonempty valid cart can be confirmed for pay on collection,
stock is revalidated and never goes negative, and the shopper receives a
confirmation identifying the ordered items and total. Detailed design is deferred.

### F3 — Low-stock cue

Done when cards and details show “Only 1 copy left” at stock 1 and
“Only N copies left” at stock 2 or 3, with no cue above 3 or at 0.
This extends the ready-made ticket by explicitly settling the zero-stock case.

## Out of scope

Search by author (FB-08) and gift wrapping (FB-09, ON-05) remain deferred.
No card payments or customer accounts (ON-02, ON-04).

## Rehearsal decisions

Instructor authorized preparing complete rehearsal fixtures using these choices: merge repeated additions
into one line; require positive integer quantities; reject an addition when the
combined quantity exceeds current stock; keep cart identity only for the current
page session. These are explicitly simulated design decisions, not facts inferred from feedback. No unresolved decisions block this rehearsal; actual class choices may differ.
