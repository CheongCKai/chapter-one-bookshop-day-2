# Dev cloud-agent workflow migration review

Date: 2026-10-27
Request: align `dev` with `main`'s `ready-for-agent` approval policy and
`shipping-a-feature` delivery workflow, so approved checkout-demo issues can run
against the branch that contains checkout.

Base: `dev` at `775c4910f1df74092850da0302b2597f52bd8415`.
Configuration source: `main` at `ed400656b2bf17de811d9354fd7781681b88868a`.
Reviewed scope: the migration working tree against the base, before committing.
Independent reviewer: `review_dev_workflow`, using `requesting-code-review`.

## Findings and resolution

No blocking findings. The reviewer verified that explicit role and skill
references resolve, obsolete AFK routing is removed, the orchestrator supports
approved-issue delegation, and the existing checkout spec and `id` contract are
preserved. Backend `src/` is unchanged; inspected frontend and test changes are
formatting only. The manifest and lockfile match `main`.

Two minor findings were corrected: CI documentation now includes pushes to `dev`,
and the issue form explains that labeling starts validation while manual Copilot
assignment starts the agent session.

## Verification

The migration coordinator ran the following after installing the copied lockfile
with `npm ci`:

| Check                          | Evidence                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Workflow configuration smoke   | Role files, required skills, routing present; obsolete AFK references absent |
| `npm run format:check`         | Passed                                                                       |
| `npm run lint`                 | Passed                                                                       |
| `npm run typecheck`            | Passed                                                                       |
| `npm test`                     | 4 files and 35 tests passed                                                  |
| `npm audit --audit-level=high` | Passed; 0 vulnerabilities                                                    |
| `git diff --check`             | Passed                                                                       |

The final wording fixes and this report were checked again for formatting.
The independent reviewer inspected the diff; validation execution evidence above
was collected by the coordinator, not the reviewer.

## Handoff limits

This change prepares a PR targeting `dev`; it does not merge it or start a
Copilot session. Required GitHub CI and Copilot review are platform evidence to
check on the PR before human review and merge. After merge, select `dev` when
assigning issue #5, and inspect session logs for actual subagent delegation.

VERDICT: READY
