---
name: capturing-intent
description: "Use when turning feedback, research, pain points, or a product idea into agreed requirements before feature design."
---

# Capturing Intent

Capture what is wanted, why it matters, and the constraints. Keep solution
design for the later spec.

**Announce first:** `Using capturing-intent — <current step>.`

## Resolve sources and destination

Read the user's supplied sources and relevant repository instructions.
Use the project's existing requirements location and identifiers. If no
convention exists, use `docs/intent.md` and feature IDs `F1`, `F2`, and so on.
State the selected source set and output path before drafting.

Input may be supplied in the conversation, files, or accessible linked material.
Do not require a particular input directory. Read relevant architecture decisions
and terminology where available; missing optional documents are not blockers.
If source material is unavailable, identify what is missing instead of inventing it.

## Workflow

1. **Synthesize the problem.** Group the evidence into pain points. Give each
   source a stable reference (an existing ID, path and section, or URL). Show
   the synthesis and distinguish evidence from assumptions.
2. **Clarify material gaps.** Ask one question at a time, only where the evidence
   leaves a decision open: users, outcomes, constraints, scope, or priority.
   Prefer concise choices when useful.
3. **Draft the intent.** Use the project's template, or the structure below.
   Keep existing feature IDs stable when updating an intent.
4. **Self-check.** Every feature traces to a pain point and source. Acceptance
   criteria describe observable outcomes. Features are small enough to review
   and deliver independently. Requirements respect established constraints.
   Unresolved decisions remain explicit.
5. **Review.** Present the written artifact and request approval. Apply changes
   until the responsible person approves that version. Reuse explicit approval
   already given for the same written version; do not infer it from "start."
6. **Record and commit.** Record approval, approver, date, and source references.
   Do not invent an approver's identity. Follow
   `.github/skills/committing-changes/SKILL.md` when committing is authorized
   by the request or the agreed workflow.
7. **Hand off.** Report the artifact path and feature identifiers. Explain that
   `shipping-a-feature` can take a selected feature through design and delivery.
   Stop unless the user has also requested that next step.

## Default structure

```markdown
# Intent — <topic>

Status: Draft
Approved by: <fill only after approval>
Date: <date>
Sources: <source references>

## Problem
<Who is affected, what happens, and the impact.>

## Pain points
| ID | Pain point | Evidence |
| --- | --- | --- |
| P1 | <problem> | <source references> |

## Desired outcomes
- <Observable outcome.>

## Constraints
- <Evidence-backed product, business, or technical constraint.>

## Features
| ID | Feature | Solves | Priority |
| --- | --- | --- | --- |
| F1 | <name> | P1 | <agreed priority> |

### F1 — <name>
- **User value:** <User, capability, and benefit.>
- **Done when:** <Observable acceptance criteria.>
- **Not in this feature:** <Boundaries.>

## Out of scope
- <Agreed exclusions.>

## Open questions
- <Unresolved decisions, including questions for design.>
```

Use the team's prioritization scheme. Do not force a fixed number of pain
points or features. Preserve technical constraints explicitly present in the
sources, but do not invent APIs, data models, or implementation details.
