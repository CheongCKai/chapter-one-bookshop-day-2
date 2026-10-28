# FB-06 Low-Stock Cue Design

Traces to: issue #9 / F3 / FB-06

## Approval

- Mode: approved-issue mode
- Recorded approval: `ready-for-agent` applied by `@pengbin2015`, a write-enabled user, per the repository approval policy
- Approval evidence: <https://github.com/pengbin2015/chapter-one-bookshop-day-2/issues/9#issuecomment-6458427150>
- Approved issue-body SHA-256: `c6d3e4b0831cf10113f230bf90b5fb64b9dcc00536a06d82966b752e33f5844c`
- Approved source: issue #9 scope and plan supplied in the task context
- Design snapshot date: 2026-10-28

## Goal

Help shoppers notice books with only 1–3 copies remaining by showing a distinct low-stock cue on both catalogue cards and book details, without changing existing catalogue behaviour.

## Design

In `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/public/app.js`, add one small pure shared renderer for the low-stock message and use it from both `bookCardHTML` and `bookDetailHTML`.

- Stock `1` renders `Only 1 copy left`.
- Stock `2` or `3` renders `Only N copies left`.
- Stock `0`, stock above `3`, and values outside the defined range render no cue.
- Both views use the same semantic markup and CSS class so wording and presentation cannot drift.
- The cue sits with the existing book information: before the card footer on catalogue cards and near the price in book details.
- Any dynamic value inserted into HTML remains escaped through the existing escaping convention.

In `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/public/styles.css`, style the shared class with the existing visual palette so the cue is clearly distinguishable without adding inline styles or another stylesheet.

Existing title, author, price, description, cover, navigation, and API rendering/data flow remain unchanged.

## Testing and Delivery

Extend `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/tests/render.test.ts` first. Record the expected RED result before implementation. For each of `bookCardHTML` and `bookDetailHTML`, cover stock values `0`, `1`, `2`, `3`, and `4`, asserting exact singular/plural wording for `1`–`3` and absence for `0` and `4`. Preserve or extend escaping coverage so rendered dynamic content cannot become executable markup.

After the smallest implementation, run:

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm audit --audit-level=high`
6. Review the final diff for scope and accidental changes.

## Scope

Changes are limited to:

- `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/public/app.js`
- `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/public/styles.css`
- `/home/runner/work/chapter-one-bookshop-day-2/chapter-one-bookshop-day-2/tests/render.test.ts`

Excluded: cart behaviour, stock changes, API changes, search, accounts, new dependencies, frameworks, and additional CSS files.

## Done when

- A catalogue card and its book detail visibly show `Only 1 copy left` when stock is `1`.
- Both views visibly show `Only 2 copies left` and `Only 3 copies left` for stock `2` and `3`.
- Neither view shows a low-stock message for stock `0` or stock `4` and above.
- Existing title, author, price, navigation, and API behaviour are preserved.
- Pure rendering tests cover stock `0`, `1`, `2`, `3`, and `4` for both rendering helpers.
- Dynamic rendered content remains escaped.
- No dependency, framework, inline styling, or additional stylesheet is introduced.
- All delivery commands listed above pass, and the reviewed diff contains only approved-scope changes.

## Unresolved Product Decisions

None. The approved issue defines the thresholds, wording, affected views, constraints, and exclusions.
