# Real-browser verification — F1 rehearsal

Browser: installed headless Chromium, driven through Chrome DevTools Protocol.
Tested implementation: f9a277fd5ce3ec6428481ccd2103860c033420d8.
Date: 2026-10-23. This is a prepared rehearsal, not a cloud-agent session.

## Executed checks

- Loaded the real Express storefront and observed eight catalogue cards.
- Clicked Add twice rapidly: exactly one POST /api/carts (201), two item POSTs
  (200), one visible line quantity 2 and total $29.98.
- Updated quantity to 3: PATCH 200, total $44.97.
- Entered quantity 0: PATCH 400, visible error, prior confirmed total retained.
- Injected one rejected fetch in the browser to simulate a network failure:
  message visible, item retained, subsequent real Remove succeeded. This fault
  injection is explicitly simulated; the other HTTP checks reached the server.
- Removed final line: DELETE 204, then authoritative GET 200, empty zero cart.
- Navigated About, Home and book details; added from detail using the same cart.
- Stopped and restarted only the development server started for this task,
  without reloading the browser. Old cart GET returned 404; visible error and
  explicit New cart action appeared. Last confirmed contents remained until
  that action created a new empty zero cart.
- Added again after reset. Captured and visually inspected the cart page at
  1280 by 900: title, quantity, unit/line/grand totals and controls readable.
- No uncaught JavaScript exception was observed during these browser runs.

Source helper scripts and screenshot were retained outside the checkout in the
prepared workspace. The committed Vitest render/interaction suites provide
repeatable checks without a browser dependency. A manual classroom smoke check
is still sensible on the presentation machine and network.

## Reproduce manually

Use Node 20, npm ci and npm run dev on the completed-cart branch. Add the first
book twice, open Cart, update to 3, try 0, remove the line, and use About/Home.
For restart recovery leave a nonempty cart open, restart the server, click Cart,
then explicitly start a new cart. Reloading the page intentionally starts a new
cart, so do not reload during the server-restart check.
