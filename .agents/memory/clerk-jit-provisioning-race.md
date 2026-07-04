---
name: Clerk JIT user provisioning race
description: Why first-load dashboard requests must provision users race-safely, and the pattern that works.
---

# Clerk JIT user provisioning must be race-safe

A dashboard/homepage that fires several authenticated API calls in parallel (e.g. profile + stats + activity) will call the "resolve/provision current user" helper concurrently. For a brand-new user, a naive check-then-insert (`SELECT` → if missing `INSERT`) makes every concurrent request try to insert the same row at once → unique-constraint (duplicate key) violation → intermittent 500s on first load only. The symptom is easy to miss: it "recovers" on the next render, and a downstream write (e.g. a profile edit) can silently fail because one of the parallel provisioning calls errored.

**Why:** JIT provisioning runs on first authenticated request, not via webhook, so the very first page load is the exact moment N requests race to create the same user.

**How to apply (pattern that works with Drizzle/Postgres):**
- Provision with `insert(...).onConflictDoNothing({ target: <uniqueCol> }).returning()`. If `returning()` is non-empty you won the race — do first-time side effects (seed activity/audit rows) here. If empty, `SELECT` the row a losing request created and return it.
- For "new session" side effects (increment sign-in count, log a sign-in event) use a conditional `UPDATE ... WHERE last_session_id IS NULL OR last_session_id != :sessionId ... RETURNING`. Postgres row locks make only one concurrent request match, so `RETURNING` tells you who performed the transition — no double counting.

**How to apply (testing):** e2e-test the very first load of a brand-new authenticated user and assert no 500s; a second run with an already-provisioned user hides the bug.
