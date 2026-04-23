---
name: mongoose-model
description: Create a Mongoose schema and model with timestamps, indexes, and sensible defaults. Use when the user asks to "add a model", "create a Mongoose schema", or introduce a new collection to a MongoDB/Mongoose app.
tags: [mongoose, mongodb, model, schema, mern]
version: 1.0.0
---

# mongoose-model

Generate a new Mongoose model file.

## Ask first

1. Model name (PascalCase, singular — e.g. `User`, not `Users`).
2. Fields: name, type, required, unique, default, index?
3. Any relationships (`ref` to other models)?
4. Needs virtuals, pre-save hooks, or static methods?

## Produce

Create `src/models/<Name>.js`:

```js
const mongoose = require('mongoose');

const <Name>Schema = new mongoose.Schema(
  {
    // fields
  },
  { timestamps: true }
);

// indexes
<Name>Schema.index({ /* ... */ });

module.exports = mongoose.model('<Name>', <Name>Schema);
```

## Rules

- Always include `{ timestamps: true }` unless the user explicitly declines.
- Compound indexes go via `.index()` calls, not inline on the field.
- `unique: true` on a field also creates an index — don't double-declare.
- If the project uses TypeScript, produce `.ts` with a `<Name>Document` interface extending `mongoose.Document`.
- For passwords: never store plaintext; require bcrypt and add a `pre('save')` hook that hashes on modification.

## After writing

- Show the user the import line: `const <Name> = require('../models/<Name>');`
- If seed scripts exist, suggest adding a seed entry.
