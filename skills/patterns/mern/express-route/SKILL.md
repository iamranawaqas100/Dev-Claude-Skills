---
name: express-route
description: Scaffold an Express route with input validation, async handler, and error forwarding. Use when the user asks to "add an endpoint", "create a route", or define a new REST resource in an Express/Node backend.
tags: [express, backend, api, node, mern]
version: 1.0.0
---

# express-route

Generate a new Express route module plus its wiring.

## Ask first

1. Resource name and HTTP method(s) (e.g. `GET /users/:id`, `POST /users`).
2. Where is the Express `app` or `Router` set up? (look for `app.js`, `server.js`, `src/routes/index.js`).
3. Validation library in use — `zod`, `joi`, `express-validator`, or none?
4. Auth required (middleware name)?

## Produce

Create `src/routes/<resource>.js` (or `.ts`):

```js
const { Router } = require('express');
const router = Router();

router.<method>('<path>', /* auth, */ async (req, res, next) => {
  try {
    // validate req.body / req.params / req.query
    // call service / model
    res.status(<code>).json(...);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

Then wire it in the main routes file (`app.use('/<resource>', require('./routes/<resource>'))`).

## Rules

- Always wrap async handlers with try/catch and forward to `next(err)` — never let rejections escape.
- Validate inputs at the top of the handler; fail with 400 + a clear message.
- Status codes: 200 reads, 201 creates, 204 deletes, 400 validation, 401/403 auth, 404 missing.
- Don't introduce a new validation library if the project already uses one.

## After writing

- If the project has tests for routes (supertest), add one happy-path test.
- Report: new file path + the line you added to the main routes file.
