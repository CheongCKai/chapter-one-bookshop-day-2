---
name: committing-changes
description: "Use when asked to commit changes or when an authorized workflow reaches a commit step."
---

# Committing Changes

**Announce first:** `Using committing-changes.`

1. Read repository commit conventions and inspect the branch, working tree,
   staged diff, and unstaged diff.
2. Identify one logical change. Preserve unrelated staged and unstaged work;
   do not reset, discard, or include it implicitly.
3. Stage only the relevant paths or hunks. Exclude credentials, local
   configuration, dependencies, and generated files unless they are intended
   tracked artifacts under the project's conventions.
4. Review the staged diff and write a message using the repository's format
   and terminology. If no format is specified, use a Conventional Commit:
   `type(scope): summary`, with a short body explaining why where useful.
   A glossary is optional; use it when the project has one.
5. In interactive work, show the files and proposed message. Commit within
   the authorization already given; ask only if scope or ownership is unclear.
   Subagents follow the same scope rules without an extra presentation step.
6. Run the commit with hooks enabled. If a hook changes files, inspect its
   changes and re-stage only relevant changes before retrying. Do not bypass
   a failing check.
7. Report the commit ID and remaining working-tree changes. Do not push
   unless the user or enclosing workflow also authorizes publishing.
