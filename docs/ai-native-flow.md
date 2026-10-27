# Reusable feature delivery workflow

The agents define responsibilities; the skills define procedures. Requirements,
design, plan, implementation, review, and pull request form a traceable chain.
The workflow applies to the receiving project's domain, architecture, and tools.

## Project conventions

Read repository instructions before starting. Use project conventions for:

| Choice                 | Resolution                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Input sources          | User-supplied evidence and relevant project sources; no required input folder        |
| Requirements           | Existing requirements artifact and IDs; default to `docs/intent.md` and F1-style IDs |
| Design, plans, reviews | Existing locations; otherwise the defaults in `shipping-a-feature`                   |
| Branches and remote    | Task context, contribution guidance, and Git metadata                                |
| Checks                 | Repository instructions, build/test configuration, and CI                            |
| Approval and review    | Recorded approval for the current artifact version and the team's review policy      |
| Models                 | Team-approved model choices in agent frontmatter                                     |

Pass the resolved paths and commands to each role. Project constraints belong
in repository instructions, rather than being embedded in the reusable roles.
Optional glossaries or architecture records should be used when available.

## Roles

| Role            | Responsibility                                                        | Interactive selection |
| --------------- | --------------------------------------------------------------------- | --------------------- |
| product-manager | Capture and obtain approval for requirements                          | Yes                   |
| orchestrator    | Coordinate design through PR delivery and maintain workflow artifacts | Yes                   |
| designer        | Turn approved requirements into a written spec                        | Subagent              |
| planner         | Return a phased plan without editing                                  | Subagent              |
| implementer     | Implement and verify an approved phase                                | Subagent              |
| reviewer        | Independently check criteria and report findings                      | Subagent              |

Agent files retain the team's selected model values. Validate availability in
the receiving environment before sharing them. Different models can provide
another perspective, but do not guarantee independent reasoning or correctness.

Roles with command execution must honor their scope even when commands could
write files. Tool lists and written role rules are not equivalent to filesystem
sandboxing. Configure runtime permissions according to the team's needs.

## Use

1. Ask product-manager to capture requirements from the relevant evidence.
   Review the written intent and approve it.
2. Give the approved intent path and selected feature reference to orchestrator.
   It dispatches **designer**, which uses `brainstorming` to produce the spec.
   Review and approve the written spec.
3. Orchestrator obtains the phased plan from planner. Review and approve it.
4. Orchestrator alternates implementer and reviewer for each phase, records
   evidence, performs a final review, and opens a PR.
5. Review the PR and required platform checks. A human approves and merges.

Product-manager stops at approved requirements. Design and planning gates
belong to the orchestrator's delivery workflow. For approved issue work, see
[Team delivery on the cloud](cloud-delivery.md).

Use each skill's announcement to see the selected procedure. An announcement
alone is not proof that the instructions were loaded or followed.

## Demo 1 — interactive AI-native flow

Run this demo before the cloud delivery demo. It shows the same delivery contract with
the human present at the three decisions that should not be delegated:
requirements, design/plan, and merge.

### 1. Prepare the workspace

1. Open this repository in VS Code with GitHub Copilot custom agents enabled.
2. Confirm that `product-manager` and `orchestrator` appear in the agent picker.
   `designer`, `planner`, `implementer`, and `reviewer` are intentionally
   subagents and should not be selected directly.
3. Start from a clean feature branch. Do not run the delivery demo on the base
   or protected branch.
4. Show the audience the source, constraints, and routing files:
   `docs/inputs/shopper-feedback.md`, `AGENTS.md`, and
   `.github/agents/product-manager.agent.md`.
5. Confirm Node 20+ and install the existing dependencies. Run the baseline
   checks before asking an agent to change the application:

   ```bash
   npm ci
   npm run format:check
   npm run lint
   npm run typecheck
   npm test
   npm audit --audit-level=high
   ```

   Record failures as baseline evidence. A required failing check will prevent
   a later READY verdict and PR claim; do not hide it during the demo.

### 2. Capture and approve requirements

Select **product-manager** and enter:

> Turn the feedback in `docs/inputs/` into product requirements. Save the
> result at `docs/intent.md` and stop for my approval.

Expected behavior:

1. The agent announces `Using capturing-intent — ...` and names its sources
   and destination.
2. It traces pain points to feedback IDs such as `FB-01` and owner notes such
   as `ON-03`; it does not invent design or code.
3. It asks only material product questions, one at a time. Answer from the
   supplied evidence where possible; keep unresolved choices explicit.
4. It writes a draft `docs/intent.md` with stable feature IDs such as F1 and
   observable `Done when` criteria.
5. Read the actual file. Ask for corrections if needed, then explicitly say:

   > I approve this version of `docs/intent.md`.

6. The product-manager records the approver, date, sources, and approved
   status, commits the authorized requirements change, reports the available
   feature IDs, and stops. It must not create a design or plan.

Demo checkpoint: open `docs/intent.md` and follow one feature back through its
pain point to the original feedback. This is the first durable traceability
link.

### 3. Hand one feature to the orchestrator

Choose the feature to demonstrate after reading the approved intent. For
example, if F1 is the agreed cart slice, click **Build this feature →** and
ensure the handoff contains both `docs/intent.md` and `F1`. Alternatively,
select **orchestrator** and enter:

> Use `shipping-a-feature` to deliver F1 from the approved
> `docs/intent.md`. Stop at every required human gate and do not merge.

The orchestrator should announce the feature and current step, inspect Git
state, resolve the base branch and checks, and create or reuse only a branch
belonging to this feature. If the requirement is not approved, it must stop
and route the work back to product-manager.

### 4. Review design — human gate 1

The orchestrator dispatches **designer**, which uses `brainstorming` with the
approved requirement as input and should:

1. Reuse settled constraints from `AGENTS.md`, the ADRs, glossary, and intent.
2. Ask one question at a time only for genuine design choices.
3. Compare viable approaches and recommend one.
4. Write the selected design under
   `docs/superpowers/specs/<date>-<slug>-design.md` with
   `Traces to: F1`, observable `Done when` criteria, and approval metadata.
5. Return to the orchestrator without invoking `writing-plans` or any other skill.

Open and inspect the design, request any correction, then explicitly approve
that written version. The orchestrator records approval and commits the spec.
The designer does not commit and does not proceed to planning on its own.

### 5. Review the implementation plan — human gate 2

The orchestrator dispatches **planner** with the approved spec and repository
context. The planner reads the code and tests but returns markdown without
editing. The orchestrator saves it at
`docs/superpowers/plans/<date>-<slug>.md`.

Before approving, verify that the plan:

- Uses `## [ ] Phase <k> — <name>` headings and references the approved spec.
- Makes phase 1 the smallest useful end-to-end slice.
- Names exact files, behavior, acceptance criteria, and commands per phase.
- Respects the in-memory, no-framework, and no-new-dependency guardrails.
- Leaves material product decisions open instead of guessing.

Approve the written plan explicitly. The orchestrator records the approval,
marks it approved, and commits it. From this point it may continue within the
approved scope without asking for confirmation between routine phases.

### 6. Observe phase implementation and independent review

For each phase, the orchestrator should produce this visible sequence:

1. **implementer** announces the phase, writes a failing behavioral test,
   implements the smallest change, runs the applicable checks, and commits.
2. **reviewer** receives the complete phase diff and independently evaluates
   every phase criterion and check without editing files.
3. A `VERDICT: FIX` goes back to implementer. The reviewer then checks the
   whole updated phase, not only the repair. The loop is limited to two fixes.
4. A `VERDICT: PASS` records the reviewed revision and evidence, checks the
   phase in the plan, and allows the next phase to start.

Use Git history and the plan checkboxes to show that implementation and review
are separate responsibilities. If named subagents are unavailable, stop or
arrange a human review; do not present orchestrator self-review as independent.

### 7. Final review and pull request

After all phases pass, the reviewer examines the full base-to-head change and
writes `docs/superpowers/reviews/<slug>-review.md`. It must end with
`VERDICT: READY`; otherwise findings return to implementer within the bounded
fix loop.

The PR-opening step reruns the required checks, validates the branch and base,
pushes the branch, fills `.github/pull_request_template.md`, and opens a PR.
Show the audience:

- The feature, spec, plan, and final-review links in the PR.
- Exact local check results and any still-pending platform checks.
- The acceptance-criteria evidence and the actual reviewed revision.
- That the agent stops without approving or merging the PR.

The responsible human reviews the PR and platform checks, then decides whether
to merge. That is human gate 3.

### 8. Resume or demonstrate a controlled stop

To demonstrate recoverability, start a new orchestrator chat with the same
feature reference and artifact paths. It should validate approvals, phase
commits, reviewed revisions, checks, and PR state, then resume at the first
incomplete or invalid step. Changing an approved requirement, spec, plan, or
implementation invalidates the affected downstream evidence.

If time is limited, stop after either human gate and resume later. Never skip a
gate merely to finish the presentation.

## Resume

Supply the same feature reference and artifact paths in a new session. The
orchestrator verifies approval, completed phases, reviewed revisions, and PR
state before choosing where to resume. Existing files or checked boxes alone
do not prove completion. Requirement or implementation changes invalidate
affected approvals or review evidence.

## Share with another project

Copy the six role files, the four workflow skills, and their dependency skills
with supporting files and license notices. The required dependency entrypoints are:

- `.github/skills/brainstorming/SKILL.md`
- `.github/skills/writing-plans/SKILL.md`
- `.github/skills/test-driven-development/SKILL.md`
- `.github/skills/verification-before-completion/SKILL.md`
- `.github/skills/requesting-code-review/code-reviewer.md`

Dependencies have their own references; copying the complete existing skills
directory preserves those resources. Examples inside a dependency skill do not
override the receiving project's language or commands. The role/workflow
instructions govern handoffs back to the orchestrator.

The agent profiles use the `.github/agents/*.agent.md` format supported by
[VS Code](https://code.visualstudio.com/docs/agent-customization/custom-agents)
and [GitHub Copilot](https://docs.github.com/en/copilot/reference/custom-agents-configuration).
VS Code supports the `agents` field used by the orchestrator and the
product-manager handoff button. GitHub.com's cloud-agent reference currently
ignores IDE handoffs and does not document the `agents` field, so verify cloud
subagent orchestration before relying on approved-issue mode there. Other
runtimes may need equivalent role definitions and tool mappings. These files
do not install or enable subagent support.

Adapt the receiving project's instruction file rather than copying this
repository's application-specific `AGENTS.md`. Set its artifact conventions,
validation commands, branch policy, approved models, and review requirements.
The PR and issue templates can be reused after aligning them with those policies.

Application documentation, sample feedback, teaching slides, slide-generation
scripts, and the existing Node-specific CI workflow are project assets, not
part of the reusable workflow package. Validate the installed roles and run
a small end-to-end trial in the receiving environment before team adoption.
