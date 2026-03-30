# Authentication

## Overview

Authentication is handled by a dedicated `auth` service. All tokens are short-lived JWTs signed with RS256.

## OAuth 2.0

Supported providers: **Google**, **GitHub**.

Flow:
1. Client redirects to `/auth/oauth/{provider}`.
2. Server stores a PKCE challenge in Redis (TTL 5 min).
3. Provider callback hits `/auth/oauth/{provider}/callback`.
4. Server exchanges code for tokens, upserts user record, issues session.

### Scopes requested

| Provider | Scopes |
|---|---|
| Google | `openid email profile` |
| GitHub | `read:user user:email` |

## Multi-Factor Auth (MFA)

MFA is optional at sign-up and enforced for admin accounts.

### TOTP
- Library: `otplib` (Node) / `totp-rs` (Rust CLI tool)
- Recovery codes: 8 single-use codes, stored as bcrypt hashes.

### SMS fallback
- Provider: Twilio Verify
- Rate limit: 5 OTP attempts per 15 minutes per phone number.

## Session Management

- Sessions stored in Redis as `session:{uuid}`.
- TTL: 30 days, rolling (refreshed on each authenticated request).
- Logout invalidates the session key immediately.
- Force-logout endpoint: `DELETE /auth/sessions` (invalidates all sessions for a user).

## Security notes

- All auth endpoints are rate-limited: 10 req/min per IP.
- Failed login attempts beyond 10 trigger a 15-minute lock and email notification.
- Tokens are never logged. Redact `Authorization` headers in log middleware.
