---
name: shipping-a-feature
description: "Use when asked to deliver an agreed feature through design, planning, implementation, review, and a pull request."
---

# Shipping a Feature

Coordinate one feature through durable artifacts and explicit approval gates.
Read each required skill by its installed path. Repository conventions and
explicit user instructions override the default artifact layout below.

**Announce at entry and step changes:**
`Using shipping-a-feature — <feature reference> — <step>.`

## 0. Resolve context and resume state

Read repository instructions, the requested requirements or issue, contribution
guidance, and relevant CI configuration. Resolve and record the feature reference,
artifact paths, base branch, remote, and required validation commands. Pass these
resolved values to every subagent. Use existing feature IDs; only use F1-style
IDs when the project has no established scheme.

Default layout, when the project defines none:

| Artifact | Default location |
| --- | --- |
| Intent | `docs/intent.md` |
| Design | `docs/superpowers/specs/<date>-<slug>-design.md` |
| Plan | `docs/superpowers/plans/<date>-<slug>.md` |
| Final review | `docs/superpowers/reviews/<slug>-review.md` |

**Choose the entry mode before requiring an intent file:**

- **Interactive feature:** require an approved intent or equivalent requirements
  artifact containing the requested feature. If missing, report the gap and
  route requirements work to the product-manager using `capturing-intent`.
- **Approved issue:** unattended work is allowed only under the repository's
  issue-approval policy and an authorized assignment. A label alone is not
  approval unless that policy explicitly defines it as such. The issue must
  contain agreed scope, acceptance criteria, an implementation plan, and checks.
  Record its URL, revision or captured contents, approval evidence, and a local
  spec/plan snapshot so implementer and reviewer receive durable inputs.
  This entry does not require an unrelated intent file. Missing product
  decisions or an incomplete plan block unattended execution.

Inspect Git state before creating or reusing a feature branch. Resolve the base
from task context, project conventions, or remote metadata. Never assume main.
Reuse only a branch belonging to the same feature; preserve unrelated work.
Do not commit implementation to the base or a protected branch.

Resume at the first incomplete or invalid step. File existence alone is not
completion: check feature identity, approval for the current spec and plan,
completed phase commits and review evidence, fresh required checks, and the
reviewed revision. Changed requirements invalidate affected downstream work.
A PR URL counts only when it belongs to this branch and target; report a merged
or closed PR accurately instead of claiming an open handoff.

## 1. Design — human gate 1

For an interactive feature, dispatch `designer` with the approved requirements,
constraints and exclusions, resolved spec path, feature reference, and relevant
repository context. The designer reads and follows
`.github/skills/brainstorming/SKILL.md` with these overrides; the orchestrator
does not run brainstorming or write the spec itself:

- Seed it with the approved requirements, constraints, and exclusions. Do not
  re-ask settled questions.
- Use the resolved spec path and add `Traces to: <feature or issue reference>`,
  observable `Done when` criteria, and approval metadata.
- Do not commit during the write-design step. Gate 1 is approval of the written
  spec. If the user requests changes, return them to the designer. After gate 1,
  record approval and commit through `committing-changes`.
- The designer returns to the orchestrator before transitioning to
  `writing-plans`; the orchestrator dispatches the planner in step 2.

If the designer returns open product questions during interactive work, ask the
user one question at a time, then redispatch the designer with the answers.
Keep gate 1 blocked until the designer resolves those questions in the spec;
do not make product decisions on the user's behalf. In approved-issue mode, if
an open question cannot be resolved from the approved snapshot, stop and request
clarification rather than expanding the approved scope.

In approved-issue mode, dispatch the designer with the approved snapshot and
recorded approval evidence to create the required local spec snapshot without
rerunning the interactive design interview. Reuse the recorded approval for
gate 1.

## 2. Plan — human gate 2

Dispatch `planner` with the spec path, resolved artifact paths, and repository
context. It follows `.github/skills/writing-plans/SKILL.md` and returns
markdown without editing files or choosing an execution mode.

Save the plan at the resolved path. Use `## [ ] Phase <k> — <name>` headings.
Include exact files, applicable checks, acceptance criteria per phase, and a
reference to the approved spec version. Phase 1 should establish the smallest
useful end-to-end slice through the architecture relevant to this feature.
Treat each task from `writing-plans` as one phase: retain its detailed steps
under the phase heading and return here instead of offering execution modes.

Present the plan. Record the approver and date, set `Status: Approved`, and
commit after approval. Reuse approval already recorded for this version.
An approved-issue snapshot can supply this gate when its plan is complete.
Proceed through implementation and review without repeated confirmation inside
the approved scope; stop for unresolved decisions or new authority.

## 3. Implement and review each phase

For each incomplete phase:

1. Record the starting commit. Dispatch `implementer` with spec and plan paths,
   phase number, repository context, and any applicable reviewer findings.
2. Dispatch a separate `reviewer` in phase mode with the same paths, phase
   number, and the full diff from the phase's starting commit to current HEAD.
3. On `FIX`, return the findings to the implementer, then review the whole
   updated phase. Allow at most two fix rounds; report remaining blockers
   rather than cycling indefinitely.
4. On `PASS`, record the reviewed revision, evidence, and verdict in the plan
   or a linked phase report. Tick that phase and commit the completion record.

The implementer follows `test-driven-development` and
`verification-before-completion`. Validation uses this repository's commands.

If named custom agents are unavailable but subagents are supported, use fresh
subagents with the corresponding role file and resolved context. If independent
review cannot be run, report that limit and arrange human review; do not label
self-review as an independent pass.

## 4. Final review

Dispatch `reviewer` in final mode with spec and plan paths, resolved checks,
the actual base comparison, and current revision. Review the full feature,
including interactions between phases.

Save its report at the resolved review path. Require `VERDICT: READY`.
On `NOT READY`, send findings to the implementer and repeat review, allowing
at most two fix rounds. Commit the final report and completion metadata using
`.github/skills/committing-changes/SKILL.md`. Any later implementation change
requires renewed review.

## 5. Pull request

Read `.github/skills/opening-a-pull-request/SKILL.md` and pass the resolved
target, artifact paths, and review evidence. Do not merge.

## 6. Handoff — human gate 3

Report the actual PR URL, feature reference, verification status, and remaining
platform checks. Ask the responsible human to review and merge when the
acceptance criteria and project gates are satisfied. If publishing failed,
report the blocker and prepared artifacts instead of claiming delivery.
