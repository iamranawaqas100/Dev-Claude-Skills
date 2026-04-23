---
name: jwt-auth
description: Wire up JWT-based auth for an Express app — login, refresh, and an auth middleware that verifies bearer tokens and attaches req.user. Use when the user asks to "add auth", "implement JWT login", or secure existing routes.
tags: [jwt, auth, express, security, mern]
version: 1.0.0
---

# jwt-auth

Add JWT auth to an Express app. Creates login + refresh endpoints and a middleware.

## Ask first

1. User model path (e.g. `src/models/User.js`). If none, call the mongoose-model skill first.
2. Where should `JWT_SECRET` and `JWT_REFRESH_SECRET` live? (`.env` is default — confirm dotenv is configured).
3. Access token TTL (default 15m) and refresh token TTL (default 7d).
4. Storage for refresh tokens — DB (recommended) or stateless?

## Produce

1. `src/middleware/auth.js` — `requireAuth` middleware: reads `Authorization: Bearer …`, verifies with `jsonwebtoken`, attaches `req.user`.
2. `src/routes/auth.js` — `POST /auth/login` (verify password with bcrypt, issue access + refresh tokens), `POST /auth/refresh` (rotate tokens), `POST /auth/logout` (invalidate refresh token if DB-stored).
3. Add `JWT_SECRET`, `JWT_REFRESH_SECRET` placeholders to `.env.example`.
4. Install deps: `jsonwebtoken`, `bcryptjs` (only run `npm install` if the user confirms).

## Rules

- **Never** log tokens or passwords.
- Access tokens are short-lived; refresh tokens live longer and are single-use (rotate on refresh).
- Store secrets in env vars, never in the repo.
- Hash passwords with bcrypt cost ≥ 10.
- On login failure, return a generic `401 Invalid credentials` — do not reveal whether the email exists.
- Add `requireAuth` to routes on the user's request, don't auto-apply it.

## After writing

- Show the curl sequence: login → use access token → refresh.
- Remind the user to add the two JWT secrets to their real `.env`.
