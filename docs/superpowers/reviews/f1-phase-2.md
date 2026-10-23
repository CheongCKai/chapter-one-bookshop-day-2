# F1 phase 2 — independent review

Spec: rehearsal-v1, docs/superpowers/specs/2026-10-23-f1-cart-design.md.
Plan: docs/superpowers/plans/2026-10-23-f1-cart.md.
Base: 8f64b8d2dfaae0ee266c7bfb74efd7da27a7fad4.
Reviewed head: d4b34ff8ec7f65ab001ca06c7e22610ec1ce575d.
Reviewer: separate review2 agent, read-only; not class/platform approval.

No blocking findings. Criteria 3–4: catalogue-derived prices, merged quantities,
multiple lines and totals (tests/cart-items.test.ts). Criteria 5–6: exact JSON
400 for invalid quantities/shapes/malformed JSON, 404 unknown resources, with
unchanged state after rejection. Criterion 7: exact stock succeeds, combined
excess fails without mutation. Relevant 10: independent carts and defensive
nonempty snapshots (tests/store.test.ts). Backend criterion 11: cents arithmetic,
client price/title ignored. UI formatting remains phase 4.

Actual RED: 21 failed, 2 passed, exit 1. GREEN: 39 passed, exit 0.
Raw outputs: docs/demo/evidence/f1-phase-2-*.txt.
Fresh independent npm test: 39 passed across 6 files, exit 0.
Fresh npm run typecheck and npm run lint: exit 0 each.
Root live HTTP: repeated addition produced quantity 2, one line, total 29.98;
overstock returned 400 and left cart unchanged.
Original tests intact; no dependency/unrelated feature changes.

Baseline audit remains a final-review blocker; no platform checks claimed.

VERDICT: PASS
