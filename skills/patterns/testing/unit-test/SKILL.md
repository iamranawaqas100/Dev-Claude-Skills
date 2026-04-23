---
name: unit-test
description: Write fast, isolated unit tests for a pure function, class, or component using Jest/Vitest with Arrange-Act-Assert structure. Use when the user asks to "add unit tests", "cover this function", or mentions Jest/Vitest.
tags: [testing, unit, jest, vitest]
version: 1.0.0
---

# unit-test

Test one unit, no I/O, fast.

## Ask first (if not already clear)

1. Which unit? (One function, one class, one component.)
2. Jest or Vitest? (Match the project.)
3. Does it have dependencies? (If yes, pass fakes — don't reach for `jest.mock` by default.)

## Produce

- Colocated test file: `<name>.test.ts` (or `.test.tsx` for components).
- One `describe` per unit, one `it` per behavior.
- Arrange → Act → Assert structure, with blank lines between phases.

## Example

```ts
describe("calculateDiscount", () => {
  it("applies 10% for orders over $100", () => {
    // Arrange
    const order = { total: 150 };

    // Act
    const discount = calculateDiscount(order);

    // Assert
    expect(discount).toBe(15);
  });

  it("returns 0 for orders under $100", () => {
    expect(calculateDiscount({ total: 50 })).toBe(0);
  });
});
```

## Conventions

- **One assertion per test** when possible. Multiple related assertions (same object) are fine; testing multiple behaviors is not.
- **Test names describe behavior**, not implementation: `"returns 0 for empty cart"`, not `"it calls reduce"`.
- **No shared mutable state** between tests. Each test sets up what it needs.
- **No real I/O** — no DB, no network, no filesystem. If you need I/O, it's an integration test (different skill).
- **Prefer fakes over mocks**. Hand a function a fake implementation via constructor/args rather than `jest.mock("./module")` which is action-at-a-distance.
- **Snapshot tests** only for stable, meaningful output (formatted strings, small DOM). Don't snapshot entire component trees — tests become impossible to read.

## What NOT to test

- Framework code (React renders things — already tested by React).
- Third-party libraries (they have their own tests).
- Trivial getters/setters / pass-through code.
- Implementation details (internal helper functions): test through the public API.

## After writing

- Run just this file: `npm test -- <name>` and confirm green.
- Tests should complete in under 100ms each. Slow tests are usually integration tests in disguise.
