# Low-stock cue — rehearsal contract snapshot

Traces to: FB-06 and the ready-made ticket in docs/cloud-delivery.md.
Version: rehearsal-v1, 2026-10-23.
Status: Approved for rehearsal only — simulated issue/Gate 1 approval.
Authorization: instructor explicitly requested complete rehearsal checkpoints;
no actual GitHub issue, maintainer label or class vote is represented.

Source contract: docs/demo/low-stock-issue.md. Main baseline:
d919003d66f37c03ba4f0b4b803def160e655a75. Independent of F1 cart changes.

## Design

Use the existing bookCardHTML and bookDetailHTML pure helpers, optionally with
a shared private helper for a message paragraph. At stock 1 show “Only 1 copy
left”; at stock 2 or 3 show “Only N copies left”. At stock 0 or above 3 show no
cue. The zero case is an explicit authorized rehearsal choice for the slide 37
ambiguity; the actual class can decide differently.

Use a class styled distinctly in public/styles.css. Keep dynamic HTML escaping.
No API, cart, navigation, dependency, framework or additional CSS-file changes.
No live platform approval or GitHub Actions evidence may be invented.

## Done when

1. Both card and detail show exact singular text at stock 1.
2. Both show exact plural text at stock 2 and 3.
3. Neither shows a low-stock cue at stock 0 or 4.
4. Existing title, author, price, navigation, escaping and API behavior remain.
5. Tests cover both helpers and all stock boundaries; existing tests intact.
6. Styles stay in existing stylesheet; no dependencies or API/cart code added.

## Checks

Run all five repository commands. Baseline audit failure remains blocking for
READY/merge; a useful completed rehearsal is distinct from merge eligibility.

## Open questions

None for this simulated version. Actual issue approval still needs a maintainer
label and workflow evidence on GitHub. No merge is authorized.
