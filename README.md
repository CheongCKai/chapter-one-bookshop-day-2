# Chapter One Bookshop

A deliberately small online bookshop, used as the working codebase for the
**AI-Augmented SDLC** course. It is real enough to feel like a product and small
enough to hold in your head.

The `dev` demo can browse the catalogue, open a book, manage a cart, and check
out. The `main` starter contains catalogue browsing and book details only.
Select the issue's specified starting branch when assigning cloud-agent work.

The orchestrator follows `shipping-a-feature` for design, planning,
implementation, independent review, and PR handoff. A maintainer's
`ready-for-agent` label records approval of a complete issue. Actions validates
the issue; the maintainer then assigns Copilot manually.

See [Team delivery on the cloud](docs/cloud-delivery.md) for the assignment
steps and [the feature workflow](docs/ai-native-flow.md) for the role handoffs.

## Run it

Requires **Node 20+**.

```bash
npm install
npm run dev        # http://localhost:3000
```

In another terminal:

```bash
npm test           # run the current branch's suite
curl localhost:3000/api/health
curl localhost:3000/api/books
```

## What's in the box

```
src/            Express + TypeScript backend (run with tsx — no build step)
  routes/       API routes, mounted in app.ts
  data/seed.ts  the starting catalogue
  store.ts      in-memory data store (resets on restart)
public/         the storefront — plain HTML + vanilla JS + one stylesheet
tests/          Vitest suite (Supertest for the API, pure helpers for rendering)
docs/           domain glossary and architecture decision records (ADRs)
.github/        Copilot steering: AGENTS.md conventions, instruction files,
                skills, workflow configuration, and demo agent roles
```

## Catalogue API

| Method | Path             | Purpose                           |
| ------ | ---------------- | --------------------------------- |
| GET    | `/api/books`     | the whole catalogue               |
| GET    | `/api/books/:id` | one book by its slug id, or `404` |
| GET    | `/api/health`    | liveness check                    |

## Scripts

`npm run dev` · `npm start` · `npm test` · `npm run typecheck` ·
`npm run lint` · `npm run format` / `npm run format:check`

## Working with AI agents here

Read **`AGENTS.md`** first — it holds the conventions and guardrails. Path-specific
rules live in `.github/instructions/`,
custom agents in `.github/agents/`, and skills in
`.github/skills/`.

For approved issue work, use `shipping-a-feature` in approved-issue mode on a
feature branch from the issue's specified base. For new features, follow the
requirements and approval gates in `AGENTS.md`. Open a PR for Copilot review
followed by human review; leave merging to the human.
