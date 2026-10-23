# A6 — Spot the weakened test

Synthetic classroom exercise, matching slide 31's speaker notes.
This fenced example is deliberately incorrect. It is not an executable test,
not a real reviewer finding, and not part of the passing regression suite.

Before:

```typescript
expect(response.status).toBe(400);
```

After:

```typescript
expect(response.status).not.toBe(200);
```

Ask: could the suite remain green while the API is wrong? Name two wrong
statuses that would satisfy the second assertion.

Instructor answer: 201 and 500 both pass the weakened assertion. It no longer
proves the Done-when criterion “quantity 0 returns 400.” Keep the exact 400
assertion in the actual tests and check the cart remains unchanged after failure.

The RED/GREEN logs supplied with the phase reports are real command output.
This exercise is synthetic; do not describe it as an actual bad change made
by the implementer or as a live class run.
