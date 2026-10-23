# Day 2 demo verification

Deck: Day-2-AI-Augmented_SDLC-v5.pptx (68 slides).
Baseline: d919003d66f37c03ba4f0b4b803def160e655a75 on main.
Verified on 2026-10-23 with Node 20.20.2 and npm ci.

## Slide-to-repository check

| Slides       | Demo                                     | Finding                                                                                                                                                                                                                                                                      |
| ------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8–10         | Roles, permissions and skill routing     | Six agent files and referenced skills exist. Designer has read/search/edit, no execute. Planner has read/search only. Tool permissions and instructions constrain actions; this is not a security sandbox.                                                                   |
| 11–12        | Capture intent                           | All FB-01…10 and ON-01…05 exist. Main has no intent artifact; rehearsal draft now provided.                                                                                                                                                                                  |
| 13–15        | F1 spec / Gate 1                         | Main has no F1 spec. Duplicate merge versus rejection is an actual product decision, not settled by FB-10.                                                                                                                                                                   |
| 17–20        | Four-phase plan / Gate 2                 | Main has no plan. Existing remote dev is an older two-phase cart-and-checkout implementation; do not use it as a matching four-phase fallback. Artifact A4 is absent.                                                                                                        |
| 23–26, 28–31 | Verification, TDD and independent review | Skills and agent instructions exist. Starter has 12 passing tests. There is no F1 run, phase history or RED evidence on main. A6 is absent; any weakened-test exercise must be labelled synthetic.                                                                           |
| 27           | Husky / lint-staged                      | Neither package nor hook is installed. Slide is an optional concept example and conflicts with the no-new-dependencies rule if treated as an instruction to install. No dependencies added.                                                                                  |
| 35–44        | Low-stock issue to PR                    | Issue form, approval workflow, ready-made ticket and manual assignment instructions exist. Label validates and records approval; it does not assign Copilot. Form introduction and workflow error/comment wording still imply starting the agent; explain manual assignment. |
| 40, 43       | Cloud platform capabilities              | Cannot establish platform behaviour from repository files. GitHub API access is forbidden here; cloud handoffs, current time limits, security defaults and settings need a real platform dry run.                                                                            |
| 60           | Gate 3                                   | No live low-stock PR or CI result verified. A branch cannot replace an issue approval, PR review, CI run or merge decision.                                                                                                                                                  |
| 66           | Each commit fires the next gate          | This is conceptual: only PR/push CI and issue-label/edit workflow triggers exist. Local artifact commits do not automatically dispatch the next role.                                                                                                                        |

## Executed baseline checks

- npm test: PASS, 12 tests across 3 files.
- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run format:check: PASS before adding rehearsal documents.
- npm audit --audit-level=high: FAIL, 2 moderate and 3 high development dependency findings. npm reports no fix available. Do not suppress this result or claim final review READY.
- Live GET /api/health: expected status ok.
- Live GET /api/books/the-lantern-sea: expected seeded book.
- Live GET /: expected storefront HTML and app.js reference.
- Git read and branch publication: work through existing platform authentication.
- GitHub API: Forbidden. No claim about repo protections, paid plan, labels, Actions, Copilot or PR state.

## Recovery

Published demo/00-starter is the exact main baseline. Checkout it before slide 11.
Do not reset or discard an interrupted demo: use git status, then commit the work
on a separate rescue branch or stash it with untracked files before switching.
Restart npm run dev after switching; server state is in memory and resets.
Refresh npm ci when switching between branches with different lockfiles.

Rehearsal fixture approvals are not real class approvals. During class, collect
and record the class decision on the actual artifact version. A backup branch
provides files; it cannot recreate agent conversation history or platform evidence.
