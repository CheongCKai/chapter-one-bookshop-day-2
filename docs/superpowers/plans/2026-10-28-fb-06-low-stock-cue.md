# FB-06 Low-Stock Cue Implementation Plan

**Goal:** Show a shared low-stock cue on catalogue cards and book details when stock is 1–3.

**Approved spec version:** `docs/superpowers/specs/2026-10-28-fb-06-low-stock-cue-design.md` committed at `1d937d7`, tracing to issue #9 / FB-06.

## Global constraints

- Limit implementation changes to `public/app.js`, `public/styles.css`, and `tests/render.test.ts`, except required workflow artifacts.
- Show `Only 1 copy left`, `Only 2 copies left`, or `Only 3 copies left`.
- Show no cue for stock `0` or above `3`.
- Use identical semantic markup and CSS class in both views.
- Preserve existing rendering, navigation, API behavior, and escaping.
- Add no dependencies, frameworks, inline styling, or stylesheets.

## [x] Phase 1 — Add and verify the shared low-stock cue

**Spec:** Approved FB-06 snapshot at `1d937d7`.

**Files:**

- Modify: `tests/render.test.ts`
- Modify: `public/app.js`
- Modify: `public/styles.css`

### Steps

- [x] Extend `tests/render.test.ts` to import `bookDetailHTML` and cover stock values `0`, `1`, `2`, `3`, and `4` for both render helpers. Assert the exact singular/plural wording and shared `.low-stock` markup for `1`–`3`, and no message or class for `0` and `4`. Retain the existing escaping test.
- [x] Run `npm test` before implementation. Record the RED result and confirm failures arise from the missing cue.
- [x] In `public/app.js`, add the smallest pure shared low-stock renderer and use it in both `bookCardHTML` (before the card footer) and `bookDetailHTML` (near the detail price). Escape dynamic values and preserve all other markup and behavior.
- [x] In `public/styles.css`, style the shared class distinctly using the existing palette.
- [x] Run the required checks in this order:

  ```bash
  npm run format:check
  npm run lint
  npm run typecheck
  npm test
  npm audit --audit-level=high
  ```

- [x] Review the complete diff, including `git diff --check`, and confirm no implementation changes outside the approved paths.

### Acceptance criteria

- Both render helpers show `Only 1 copy left` for stock `1`.
- Both render helpers show `Only 2 copies left` and `Only 3 copies left` for stock `2` and `3`.
- Neither render helper shows a low-stock message for stock `0` or `4`.
- Both views use the same markup and `.low-stock` class.
- Existing escaping and storefront behavior remain intact.
- All five required checks pass.
- The complete diff contains only approved-scope changes, apart from workflow artifacts.

### Phase-specific checks

`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --audit-level=high`, `git diff --check`.

### Completion evidence

- Implementation commit: `1637d22`.
- RED result reported by the implementer before implementation: `npm test` failed in the new low-stock assertions for both `bookCardHTML` and `bookDetailHTML`, expecting `<p class="low-stock">Only 1 copy left</p>`. The implementer reported no unrelated failures. The independent reviewer could not verify this RED result from the available commit history.
- Independent phase review: PASS for `a415818..1637d22`; no findings.
- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (3 test files, 14 tests).
- `npm audit --audit-level=high`: passed (one moderate `qs` advisory; no high-severity findings).
- `git diff --check`: passed.

## Approval

Approved issue: #9. `ready-for-agent` approval applied by `@pengbin2015` per the repository issue policy.

Approval evidence: <https://github.com/pengbin2015/chapter-one-bookshop-day-2/issues/9#issuecomment-6458427150>.
Approved issue-body SHA-256: `c6d3e4b0831cf10113f230bf90b5fb64b9dcc00536a06d82966b752e33f5844c`.

Status: Approved
