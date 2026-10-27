# AGENTS.md — Chapter One Bookshop

Instructions for any AI agent (GitHub Copilot, Claude, etc.) working in this repo.
Keep this file short; it is loaded into the agent's context on every task.

## What this project is

Chapter One is a **deliberately small online bookshop**, used to teach the
AI-augmented software development lifecycle. The `dev` demo includes catalogue
browsing, book details, cart management, and checkout. The `main` starter and
numbered demo checkpoints have different feature sets; inspect the issue's
specified base branch before assuming a feature exists or is missing.

See `docs/glossary.md` for the domain vocabulary and `docs/adr/` for the
decisions behind the architecture. Use that vocabulary in code, tests, commits,
and any spec you write.

## How it is built

- **Backend:** Express + TypeScript in `src/`. Run directly with `tsx` — there
  is **no build step**.
- **Frontend:** plain HTML + vanilla JS + one stylesheet in `public/`. **No
  framework.**
- **Data:** an in-memory store (`src/store.ts`), seeded from `src/data/seed.ts`.
  There is **no database**; restarting the server resets all data. This is
  intentional (see `docs/adr/0001-in-memory-store.md`).
- One process, one port (default 3000). The Express server also serves `public/`.

## Commands

- `npm run dev` — start the server with reload at http://localhost:3000
- `npm test` — run the Vitest suite (must stay green)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier (write) / `npm run format:check` (verify)

## Guardrails (do not cross without being asked)

- **No new dependencies.** Solve problems with what is already installed. If you
  believe a dependency is truly required, stop and ask first.
- **No CSS frameworks.** No Tailwind, Bootstrap, etc.
- **All styling lives in `public/styles.css`** — one stylesheet, no inline
  styles, no extra CSS files.
- **No build tooling.** Do not add a bundler, transpile step, or framework.
- **Never weaken the tests to make them pass.** Fix the code, not the assertion.
- Keep cart + checkout scoped to the existing architecture: no users, no auth,
  no sessions, no database, no payment provider. Use a returned `cartId` and
  in-memory state unless the design doc explicitly changes that scope.
- The existing `dev` cart API returns its identifier as `id`, as recorded in
  `docs/superpowers/specs/2026-08-12-cart-checkout-design.md`. Preserve this
  contract when maintaining the demo.
- Implement cart + checkout in phases. A first phase should be a vertical tracer
  bullet that crosses route, store, and tests with minimal behaviour.
- Do not claim a phase is complete without fresh evidence from `npm test`,
  `npm run typecheck`, and `npm run lint`, or a clear explanation of why a
  command could not run.

## Conventions

- API routes live in `src/routes/`, mounted in `src/app.ts`.
- Every API error is JSON in the shape `{ "error": "message" }` with an
  appropriate HTTP status (see `.github/instructions/backend.instructions.md`).
- Frontend code escapes anything it puts into HTML (see
  `.github/instructions/frontend.instructions.md`).
- Tests check external behaviour, not internals (see
  `.github/instructions/tests.instructions.md`).
- Commit messages follow Conventional Commits: `type(scope): summary`
  (feat, fix, docs, chore, refactor, test).

Path-specific detail is in `.github/instructions/*.instructions.md`; those apply
automatically to the files they name.

## Skill routing — read before choosing a skill

These rules take precedence over any skill-priority rule inside a skill
(including `using-superpowers`). Pick the first row that matches, then read
that skill **by path** and follow it.

| The request...                                            | Read first                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| turns feedback, pain points, or an idea into requirements | `.github/skills/capturing-intent/SKILL.md`                                    |
| asks to design, build, or deliver a feature               | `.github/skills/shipping-a-feature/SKILL.md` (it verifies requirements first) |
| asks to open or raise a pull request                      | `.github/skills/opening-a-pull-request/SKILL.md`                              |
| asks to commit                                            | `.github/skills/committing-changes/SKILL.md`                                  |
| a bug or failing test                                     | `.github/skills/systematic-debugging/SKILL.md`                                |

Every skill and agent starts its reply with an announce line
(`Using <skill> ...` or `<agent>: ...`). Read the chosen file; an announcement
alone is not proof that its instructions were followed.

For intent-based work, specs trace to the relevant feature ID. For a standalone
approved issue, trace to the issue and its recorded approval instead.

Reusable agents and skills resolve project choices from this file. This
repository uses `docs/intent.md`, the artifact directories under
`docs/superpowers/`, and the commands listed above. Final review also runs
`npm run format:check` and `npm audit --audit-level=high`. Its PR review order
is Copilot review followed by human review. For issue work, the
`ready-for-agent` label applied by a user with write access is the recorded
approval; `.github/workflows/assign-to-agent.yml` validates the issue and records
the approval; the maintainer then assigns Copilot manually in the GitHub UI.

## What else is in .github/

- `agents/` — role agents. `product-manager` and `orchestrator` appear in the
  agent menu; `designer`, `planner`, `implementer`, and `reviewer` run only as
  subagents. Each agent file sets its model, tools, and the skills it reads.
- `skills/capturing-intent/`, `skills/shipping-a-feature/`,
  `skills/opening-a-pull-request/`, `skills/committing-changes/` — this repo's
  own skills for the intent-to-PR flow.
- `skills/brainstorming/`, `skills/using-git-worktrees/`,
  `skills/writing-plans/`, `skills/subagent-driven-development/`,
  `skills/executing-plans/`, `skills/test-driven-development/`,
  `skills/requesting-code-review/`,
  `skills/finishing-a-development-branch/`, `skills/writing-skills/`,
  `skills/using-superpowers/`, `skills/systematic-debugging/`, and
  `skills/verification-before-completion/` — vendored Superpowers skills.
- `pull_request_template.md` — the PR body every agent-opened PR fills in.
- `ISSUE_TEMPLATE/ready-for-agent.yml` — issue form for small, well-defined
  tickets that Copilot cloud agent can deliver as one pull request.
- `workflows/assign-to-agent.yml` — validates the issue and records the approval
  when a maintainer adds the `ready-for-agent` label; the maintainer then assigns
  Copilot manually in the GitHub UI.
- `workflows/ci.yml` — the checks above, on every pull request and on `main` and `dev`.
- `workflows/copilot-setup-steps.yml` — installs dependencies for the agent.

## The intent-to-PR flow

See `docs/ai-native-flow.md` for the full picture. In short:

1. `capturing-intent` — raw input in `docs/inputs/` → approved `docs/intent.md`
   with features F1…Fn.
2. `shipping-a-feature` — for one feature: `designer` runs `brainstorming`
   and writes the spec (gate 1) → `writing-plans` (plan, gate 2) → implement
   phase by phase with `test-driven-development` +
   `verification-before-completion` → `requesting-code-review` →
   `opening-a-pull-request` → a human reviews and merges (gate 3).

This repository uses a feature branch instead of `using-git-worktrees`, and
`opening-a-pull-request` instead of `finishing-a-development-branch`.

## Team delivery on the cloud

See `docs/cloud-delivery.md`: a maintainer labels a well-defined issue
`ready-for-agent`, Copilot cloud agent delivers it with `shipping-a-feature` in
approved-issue mode, and a developer reviews and merges the pull request.
