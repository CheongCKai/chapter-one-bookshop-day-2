# Day 2 classroom recovery

These checkpoints are prepared rehearsals using simulated class approvals.
They are not recordings of a live class or a Copilot cloud run.

## Checkpoints

| Resume at                             | Completed files already available                                    | Branch                                          |
| ------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| Step 0: capture intent, slide 11      | Original starter only                                                | `demo/00-starter`                               |
| Gate 1: design F1, slide 13           | Rehearsal intent (A2)                                                | `backup/01-intent-approved` / `demo/01-intent`  |
| Gate 2: plan, slide 18                | Intent and F1 spec (A3)                                              | `backup/02-spec-approved` / `demo/02-spec`      |
| Phase loop, slide 20                  | Intent, spec and four-phase plan (A4)                                | `backup/03-plan-approved` / `demo/03-plan`      |
| Build phase 2                         | Phase 1 create/get API                                               | `demo/04-cart-phase-1`                          |
| Build phase 3                         | Phase 2 add/merge API                                                | `demo/05-cart-phase-2`                          |
| Build phase 4                         | Phase 3 update/remove API                                            | `demo/06-cart-phase-3`                          |
| Module 5 review, slide 31             | All four F1 phases and review evidence                               | `backup/04-loop-done` / `demo/07-cart-complete` |
| Module 6 issue demo, slides 36–44     | Independent starter plus low-stock issue text, before implementation | `backup/05-low-stock-ready`                     |
| Module 6 fallback / Gate 3 discussion | Independent low-stock implementation and evidence                    | `backup/06-low-stock-done`                      |

The low-stock branches deliberately fork from the starter, independently of F1,
so their diff against main does not contain cart work.

A branch is the input state for the next step. Checkout the branch below the
failed step, not the failed step's starting branch. Example: if intent synthesis
fails, checkout `backup/01-intent-approved` and continue with Gate 1.

## Switch without losing the interrupted demo

Stop your development server with Ctrl-C. Inspect the working tree:

```bash
git status --short
```

If changes exist, preserve them before switching. One option is:

```bash
git stash push --include-untracked -m "classroom interrupted demo"
```

This preserves tracked and untracked work, not ignored files. Do not put secret
files into commits or stashes. Alternatively commit your selected files to a
separate rescue branch. Never use `reset --hard`, `clean`, or force checkout to
recover a classroom demo.

```bash
git fetch origin
# Example: intent failed; resume at design.
git switch backup/01-intent-approved
npm ci
npm run dev
```

If the local branch does not exist, use:

```bash
git switch --track origin/backup/01-intent-approved
```

Use Node 20 (`nvm use` if available). In the prepared cloud environment:

```bash
export PATH=/workspace/.cloud-tools/node20/node_modules/.bin:$PATH
cd /workspace/chapter-one-bookshop-day-2
```

Restarting resets all in-memory data. Reload the browser after switching.
Reloading the cart demo also starts a fresh cart; do not promise persistence.

## Present evidence honestly

- Say “prepared rehearsal checkpoint” when switching to a backup.
- Approval metadata is simulated. A class vote can choose different behavior;
  the corresponding downstream backup may then be a different design.
- RED/GREEN logs and phase review reports identify tested commits. A6 is a
  synthetic weakened-assertion exercise, not a real regression in the suite.
- Required dependency audit fails at baseline; final review cannot be READY.
  All other results are reported separately. No CI or audit was disabled.
- Branches provide source and artifacts; they do not restore an agent chat,
  issue approval, cloud assignment, PR checks, or a GitHub merge.
- For Module 6 create the actual issue, inspect the rendered body, label it as
  maintainer, verify the approval workflow, then assign Copilot manually. A
  fallback branch is a local implementation example, not a pre-run cloud PR.
- GitHub API access from this environment is forbidden. Verify paid-plan access,
  Copilot settings, label existence, protections and CI using GitHub before class.
- Do not merge with the required audit check failing. Use the failure as review
  evidence or resolve the dependency advisory in a separate authorized task.

See `verification.md` for the slide-by-slide findings and current limitations.

## Verified outcomes

Starter: 12 passing tests. Cart phase checkpoints: 16, 39, 61 and 72 passing
tests respectively, with typecheck and lint passing and independent phase
reviews. Completed cart also passes formatting and the real-browser checks.
Independent low-stock checkpoint: 24 tests, typecheck, lint and formatting pass,
plus independent review and real-browser checks. Both final reviews are
NOT READY because the unchanged required audit fails (2 moderate, 3 high).

F1 evidence is on backup/04-loop-done under docs/superpowers/reviews and
docs/demo/evidence. Low-stock evidence is on backup/06-low-stock-done at
docs/superpowers/reviews/low-stock-review.md and
docs/demo/low-stock-browser-verification.md.

Checkpoint contents were inspected directly from Git objects: starter has no
intent; intent has no F1 spec yet; spec has no plan yet; plan has no cart code;
phase 1 has create/get only; phase 2 adds items but no PATCH; phase 3 adds
PATCH/DELETE but no cart UI; completed cart has cartHTML and all review records;
low-stock-ready has unchanged starter application files; low-stock-done has
cues but no cart routes or UI. These boundaries make each branch the starting
state for the next demo. Source and dependency files on main are unchanged.

The prepared cloud workspace is returned to its original starter checkout
after publication of these branches. Begin at demo/00-starter, and explicitly
switch checkpoints when needed; no implementation was merged into main.
