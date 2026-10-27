# Workflow artifacts

These directories are the default artifact locations when the project does not
specify alternatives. Preserve the project's existing conventions when present.

- `../intent.md` — approved requirements with stable feature identifiers.
- `specs/` — feature design, source references, acceptance criteria, and
  approval evidence for the current version.
- `plans/` — approved phased plans with completion and phase-review evidence.
- `reviews/` — final reports identifying the reviewed revisions and ending in
  `VERDICT: READY` or `VERDICT: NOT READY`.

Artifact existence is not completion. Approval applies to a particular version,
and review evidence applies to a particular change. Revalidate affected work
when requirements or implementation change.
