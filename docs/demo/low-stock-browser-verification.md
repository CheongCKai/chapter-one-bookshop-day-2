# Low-stock real-browser verification

Implementation: cadd574156ed3674ed0155e756008532ac20d725.
Browser: installed headless Chromium via CDP, real Express server.
Date: 2026-10-23. Executed by root separately from independent code review.

- Eight catalogue cards loaded; four cards carried cues, matching live stock.
- Live stock 1, 2 and 3 showed exact singular/plural text; stock 12 had no cue.
- Clicked into stock-1 and stock-3 details and checked their messages.
- Back, About and Home navigation worked.
- Called the actual pure render helpers in the browser with explicit stock-0
  and stock-4 fixtures: neither output contained a low-stock cue. These are
  boundary fixtures, not assertions that those values exist in the live seed.
- No Cart navigation or cart API was present, confirming independence from F1.
- No uncaught JavaScript exception observed. Captured and visually inspected
  stock-1 details: the cue was distinct and readable beside the unchanged book
  content. Screenshot and helper script retained outside the checkout.

Use docs/demo/low-stock-issue.md for the actual classroom contract. The branch
supplies source and rehearsal evidence; it is not a real issue, cloud session,
GitHub Actions result, pre-run pull request or approval record. Required audit
failure still blocks READY and merge eligibility.
