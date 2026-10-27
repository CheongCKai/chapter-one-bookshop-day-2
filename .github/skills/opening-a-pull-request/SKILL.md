---
name: opening-a-pull-request
description: "Use when a reviewed change is ready to publish as a pull request. Verifies evidence, prepares the description, and hands off for human review."
---

# Opening a Pull Request

**Announce first:** `Using opening-a-pull-request for <branch>.`

## Establish the target and evidence

Read repository instructions, contribution guidance, and CI configuration.
Resolve the target repository, remote, base branch, required checks, PR template,
and review policy. Use explicit task context first, then repository conventions
and Git metadata. Do not assume a remote named origin or a base named main.

The working branch must be separate from the base and protected branches.
Changes to publish must be committed. Do not silently include unrelated commits
or working-tree changes; isolate the intended work or explain the blocker.

For a feature delivered by `shipping-a-feature`, require its final review
report with `VERDICT: READY`. For other requests, follow the project's review
requirements. Select the report for this change, not an arbitrary review file.
Verify its reviewed revision and diff scope. Any subsequent implementation
change invalidates the verdict until reviewed again; a commit containing only
the review report or completion metadata does not.

## Publish

1. Run the project's applicable validation commands and capture fresh results.
   Obtain commands from repository instructions and CI rather than prescribing
   a package manager. Report required platform checks separately as passed,
   pending, failed, or unavailable. A required local check that fails or cannot
   run blocks a ready handoff; never represent a pending CI check as passed.
2. Prepare a title using the team's convention. Fill the repository's PR
   template, or include purpose, scope, requirement/issue references, artifact
   links, acceptance criteria with evidence, checks, and reviewer notes.
   Mark an acceptance criterion complete only when the review supports it.
3. Confirm publishing is within the user request or enclosing workflow.
   Use an existing authorized PR integration, or the project's CLI. If using
   GitHub CLI, check availability and authentication before pushing.
4. Push the intended branch to the resolved remote without force. Check for
   an existing PR for that branch and target before creating another.
   With GitHub CLI, use explicit `--base` and `--head`, and pass a temporary
   body file with `--body-file`. If the hosting agent already owns a PR,
   update that PR through the available supported interface.
5. If the publishing integration is unavailable, provide the ready title and
   body with the exact blocker. Do not claim a PR was opened.
6. Report the PR URL, review evidence, and outstanding CI checks. Follow the
   team's review order; automated review is optional unless project policy
   requires it. Leave approval and merge to the responsible human.

Never merge, push directly to a protected/base branch, weaken checks, or
request external review notifications without authorization.
