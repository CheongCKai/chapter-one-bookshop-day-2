# Show a low-stock cue

Prepared issue body for the Ready for agent form. No real issue, maintainer
label approval, workflow run or cloud assignment is represented by this file.
The instructor authorized this rehearsal contract; actual issue approval must
still be recorded on GitHub. This demo is independent of F1: use the starter
base so a low-stock PR does not accidentally include cart code.

### Goal and desired behaviour

Shoppers cannot see which books are close to selling out (FB-06). Catalogue
cards and details should highlight stock 1–3 using the existing stylesheet.

### Acceptance criteria

- Stock 1 renders `Only 1 copy left` in card and detail HTML.
- Stock 2 or 3 renders `Only N copies left` in card and detail HTML.
- Stock 0 or above 3 renders no low-stock message. This explicitly resolves
  the ambiguity used for the slide 37 class vote.
- Title, author, price, navigation and API behavior remain unchanged.
- Rendering tests cover 0, 1, 2, 3 and 4 for both card and detail helpers.
- Dynamic content stays escaped; no additional stylesheet or dependency.

### Scope and non-goals

In scope: public/app.js, public/styles.css and pure rendering tests.
Out of scope: cart, stock changes, API changes, search, accounts, dependencies,
frameworks and new stylesheet files.

### Technical context

Book.stock exists in src/types.ts and the API. bookCardHTML and bookDetailHTML
are exported pure functions in public/app.js. Follow AGENTS.md and frontend/test
instructions. Preserve all existing behavior and tests.

### Implementation plan

Phase 1 — add tests for both render functions at stock 0–4. Run and record RED.
Add the smallest shared low-stock markup and class to pass. Style distinctly
in public/styles.css. Run the five repository checks. Review the complete diff.
The baseline dependency audit is already failing: report it, do not suppress it,
and do not claim READY or merge eligibility unless it is separately resolved.

### Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm audit --audit-level=high
```

### Readiness

- [x] One behaviour change, with objective acceptance criteria.
- [x] Scope, non-goals, and plan are explicit — no open product decisions.
- [x] No secrets, external accounts, payment providers, or production data are needed.

## Actual classroom dispatch

Create an issue using the form and copy the six sections plus checklist. Ask the
class to inspect stock-zero behavior before adopting this resolved version.
Apply ready-for-agent as maintainer; inspect Actions and the approval checksum.
Then manually assign Copilot, select orchestrator and use the approval comment's
prompt. The label alone does not start Copilot. Do not copy this file's simulated
authorization as proof of a real issue approval.
