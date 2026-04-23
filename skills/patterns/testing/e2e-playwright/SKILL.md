---
name: e2e-playwright
description: Author a Playwright end-to-end test — user-centric, stable selectors, network mocking only at the edges, retried assertions. Use when the user asks to "test the user flow", "add E2E", or is debugging a flaky UI test.
tags: [testing, e2e, playwright, browser]
version: 1.0.0
---

# e2e-playwright

Test the user's journey through a real browser.

## Ask first (if not already clear)

1. What user story? (e.g. "log in, create an order, see it in the list".)
2. Does it need authenticated state? → Reuse a `storageState.json` from a global setup.
3. Does it touch a real payment/email/SMS provider? → Mock at the network boundary, not inside the app.

## Produce

- `tests/e2e/<flow>.spec.ts`
- One `test` per user journey. Don't pack multiple journeys into one test.
- Use page object / fixtures if a flow is reused across 3+ tests.

## Example

```ts
import { test, expect } from "@playwright/test";

test("user creates a new order", async ({ page }) => {
  await page.goto("/orders");
  await page.getByRole("button", { name: /new order/i }).click();
  await page.getByLabel("Item").fill("Widget");
  await page.getByLabel("Quantity").fill("3");
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+$/);
});
```

## Selector priority (stable → fragile)

1. **Role + accessible name**: `page.getByRole("button", { name: "Submit" })` — survives restyling and i18n of non-visible text.
2. **Label / placeholder / text**: `getByLabel`, `getByPlaceholder`, `getByText`.
3. **Test id** as escape hatch: `getByTestId("submit-btn")` — add only when roles don't suffice.
4. **CSS / XPath**: last resort. Fragile.

## Conventions

- **Auto-waiting**: Playwright waits for elements automatically. Never `page.waitForTimeout(n)` — use `expect(...).toBeVisible()` which retries.
- **Web-first assertions**: `await expect(locator).toHaveText(...)` retries; `expect(await locator.textContent()).toBe(...)` does not. Always prefer the former.
- **Network mocking only for third parties**: `page.route("**/api.stripe.com/**", ...)`. Don't mock your own API — that's what integration tests are for.
- **One browser per flow is usually enough.** Matrix-run all browsers in CI if the UI is heavy on browser quirks.
- **Keep tests independent**: no test depends on data created by a previous test. Each seeds what it needs.
- **Trace on first retry**: `use: { trace: 'on-first-retry' }` in config — makes flake debugging tractable.

## Anti-patterns to refuse

- Testing business logic end-to-end. The E2E layer is thin — one happy path + one critical failure path per flow.
- `data-testid` on every element. Use roles; add test ids surgically.
- Reading from the real production DB. Use a dedicated test environment.

## After writing

- Run the test 10 times in a row: `npx playwright test <file> --repeat-each=10`. If any flake, fix before merging.
- Record a trace for the reviewer to watch: `--trace on`.
