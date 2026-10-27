# Team delivery on the cloud

The team writes a well-defined issue. A maintainer approves it by adding the
`ready-for-agent` label. GitHub Actions validates the issue, then the maintainer
assigns Copilot cloud agent in the GitHub UI. The agent works in its own sandbox
and opens a draft pull request. A developer reviews it and decides whether to merge.

```
issue ──► ready-for-agent label ──► assign-to-agent.yml ──► assign Copilot in UI ──► Copilot cloud agent ──► draft PR ──► CI + review ──► merge
 team        maintainer               Actions (validates)      maintainer               reads AGENTS.md         platform      developer
```

People decide at both ends. Nobody presses "continue" in between.

This is a teaching demo. It keeps the moving parts small and shows what is
possible; a production team would add its own approval policy, secrets
management, and review rules.

## What is in the repository

| File                                         | Purpose                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/ISSUE_TEMPLATE/ready-for-agent.yml` | The issue contract: goal, criteria, scope, context, plan, checks. Creating an issue does **not** start the agent.                                                                                |
| `.github/workflows/assign-to-agent.yml`      | On `ready-for-agent` label: verifies write access, checks all six form sections and readiness boxes, and records the approval. On issue edit: removes the label and comments. No secrets needed. |
| `.github/workflows/copilot-setup-steps.yml`  | Installs Node dependencies in the agent's environment before it starts.                                                                                                                          |
| `.github/workflows/ci.yml`                   | The five `AGENTS.md` checks on every pull request and on `main` and `dev`.                                                                                                                       |
| `.github/agents/orchestrator.agent.md`       | Follows `shipping-a-feature` in approved-issue mode.                                                                                                                                             |

## Approval policy (this repository)

The `ready-for-agent` label, applied by a user with write access, is the
recorded approval. The workflow verifies the labeler's permission, reads the
issue body fresh from the API, checks all six required sections and the three
readiness boxes, and records a comment with the body checksum. Only maintainers
should apply the label. If the issue is edited after the label is applied, the
workflow automatically removes the label and posts a comment; a maintainer must
read the new text and re-apply the label before assigning the agent.

## One-time setup

1. **Copilot cloud agent** — enable it for the repository (a paid Copilot plan
   with cloud agent allowed by your organisation's policy).
2. **Label** — create `ready-for-agent`.
3. **Workflow approval** — in the repository's Copilot cloud agent settings,
   allow Actions workflows to run on Copilot's pull requests without manual
   approval, so CI runs unattended. Leave it on the default if you prefer to
   click "Approve and run workflows" during the demo.
4. **Protect `main`** — add a branch ruleset: require a pull request, require
   the `checks` status check (from the CI workflow), block force pushes. Optionally
   request Copilot code review automatically.

## Demo — low-stock cue, issue to pull request

### Choose the starting branch

Select the issue's starting branch explicitly in the Copilot assignment dialog.
For checkout maintenance such as issue #5, use `dev` and target the pull request
at `dev`. The `main` starter has no cart or checkout; the numbered demo checkpoints
through `demo/07-cart-complete` implement cart management without checkout.
The `dev` branch uses the same `ready-for-agent` approval policy and
`shipping-a-feature` workflow as `main`.

Issue-event validation runs from the default branch, `main`. Copying the workflow
to `dev` keeps its configuration aligned; it does not create a second label
trigger. Applying the label validates and records approval. Manually assigning
Copilot starts the agent session, where the orchestrator invokes the other roles.
Check the session log for delegation and independent review before claiming
multiple agents participated.

### Run the demo

1. **Create the issue** from the **Ready for agent** form and paste the ticket
   below. Show the rendered issue. Ask the class to find one ambiguity.
2. **Approve it** — as the maintainer, add the `ready-for-agent` label.
3. **Watch the workflow** — open the **Actions** tab: `Assign issue to agent`
   runs and the approval comment appears on the issue.
4. **Start the agent** — back on the issue, open the assignees panel, assign
   **Copilot**, select **orchestrator** from the agent dropdown, and paste the
   prompt from the approval comment into the Optional prompt field. The agent
   session appears on the issue page.
5. **The pull request appears** — a draft PR on a `copilot/` branch. Walk the
   body: linked issue, criteria with evidence, local vs platform checks.
6. **Review and merge** — review the diff and the CI result, then merge.

Allow 20–40 minutes of agent time; start it before a break. Keep a pull request
from a dry run as a fallback.

### Ready-made ticket

**Goal and desired behaviour**

> Shoppers cannot see which books are close to selling out, although the API
> already returns stock (FB-06). On catalogue cards and book details, show
> "Only 1 copy left" when stock is 1 and "Only N copies left" when stock is 2
> or 3. Show nothing above 3. Style it distinctly in the existing stylesheet.

**Acceptance criteria**

- Stock 1 renders `Only 1 copy left` in card and detail HTML.
- Stock 2 or 3 renders `Only N copies left` in card and detail HTML.
- Stock above 3 renders no low-stock message.
- Title, author, price, navigation, and API behaviour are unchanged.
- Rendering tests cover the boundary values 1, 3, and 4.

**Scope and non-goals**

- In scope: `public/app.js`, `public/styles.css`, pure rendering tests.
- Out of scope: cart, stock changes, API changes, search, accounts,
  dependencies, another stylesheet.

**Technical context**

- `Book.stock` exists in `src/types.ts`; the seed data includes the boundary
  values; the API already returns stock.
- `bookCardHTML` and `bookDetailHTML` are pure helpers in `public/app.js`.
- Follow `AGENTS.md` and `.github/instructions/frontend.instructions.md`;
  keep HTML escaping.

**Implementation plan**

> Phase 1 — low-stock cue: add failing render tests for stock 1, 3, and 4 on
> card and detail output; add the smallest markup to pass; style the cue in
> `public/styles.css`; run every check.

**Checks** — keep the form's default five commands.

## Limits to state honestly

- **Subagents in the cloud.** GitHub's custom-agent reference for cloud agent
  does not document the `agents` field, so the orchestrator may not hand work
  to separate `implementer` and `reviewer` subagents there. Check in a dry run.
  If it reviews its own work, the independent review happens at the pull
  request: CI, optional Copilot code review, and the developer.
- **Agent dropdown and prompt field.** The GitHub UI assignees panel has an agent
  dropdown and an Optional prompt field. Select **orchestrator** and paste the
  prompt from the approval comment. If the orchestrator is not listed in the
  dropdown, Copilot falls back to reading `AGENTS.md` for context; paste the
  prompt anyway to direct it to use `shipping-a-feature` in approved-issue mode.
- **Public repository.** Copilot automations (issue-opened triggers) need a
  private or internal repository, so this demo uses Actions for validation and
  manual UI assignment instead.
