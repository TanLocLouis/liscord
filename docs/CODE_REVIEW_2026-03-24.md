# Liscord Codebase Review

Date: 2026-03-24
Scope: backend + frontend
Method: static review of server, auth, socket, messaging, reaction, and core UI/state paths

## Executive Summary

The codebase is feature-rich and the emoji/reaction implementation is close to production-ready, but there are several high-risk issues that must be addressed before scaling:

- Authentication guard logic is currently unsafe in backend middleware and frontend route protection.
- JWT secret handling and CORS policy are weak for production security.
- Token refresh handling mutates context state directly, leading to stale auth behavior.
- Socket and typing state are vulnerable to unnecessary churn and potential runtime errors.
- There is no automated test suite, so regressions are likely as features grow.

## Findings (Prioritized)

## Critical

1. Backend auth middleware can crash on missing Authorization header.
- File: backend/middleware/authenticate.ts
- Evidence: header guard is commented out; code calls split on possibly undefined header.
- Risk: unauthenticated requests can cause runtime exceptions and unstable behavior.
- Recommendation: restore header/token guards and return 401/403 consistently.

2. JWT secret has insecure fallback value.
- File: backend/utils/jwt.ts
- Evidence: fallback to literal secret if env var missing.
- Risk: token forgery if server runs with default.
- Recommendation: fail fast on startup when secret missing.

3. Frontend protected route checks the refreshToken function, not auth state.
- File: frontend/src/pages/ProtectedRoute/ProtectedRoute.tsx
- Evidence: route gate uses function reference, which is always truthy.
- Risk: protected screens can be accessed without valid login state.
- Recommendation: gate by accessToken and userInfo.

## High

4. fetchWithAuth mutates context object directly.
- File: frontend/src/utils/fetchWithAuth.jsx
- Evidence: context.accessToken assignment.
- Risk: bypasses React state updates and can desync UI/auth.
- Recommendation: expose a setAccessToken method from AuthContext and update state there.

5. CORS policy uses wildcard origin.
- File: backend/server.ts
- Evidence: cors() + Socket.IO origin wildcard.
- Risk: broad cross-origin exposure and abuse.
- Recommendation: use ALLOWED_ORIGINS env whitelist.

6. Email verification/reset token store is in-memory only.
- File: backend/services/authService.ts
- Evidence: Map-based tokenMemory.
- Risk: tokens lost on restart and poor horizontal scalability.
- Recommendation: store tokens in MySQL with TTL and cleanup job.

7. Hardcoded frontend links in auth service.
- File: backend/services/authService.ts
- Evidence: localhost links for verification and reset.
- Risk: broken production flows.
- Recommendation: use FRONTEND_URL from environment.

## Medium

8. Message enrichment uses N+1 database requests for usernames/avatars.
- File: backend/services/messageServices.ts
- Risk: performance degradation in active channels.
- Recommendation: batch lookup in one query.

9. Socket typing cleanup can access undefined channel sets.
- File: backend/sockets/chat.socket.ts
- Risk: runtime instability in disconnect paths.
- Recommendation: always null-check channel set before read/write.

10. Toast IDs can collide and remove behavior uses mismatched type.
- File: frontend/src/contexts/ToastContext.tsx
- Risk: duplicate toasts or incorrect removal.
- Recommendation: use UUID string IDs and typed toast model.

11. Chat typing effect depends on inputRef.current.value.
- File: frontend/src/components/ChatBox/ChatBox.tsx
- Risk: effect churn and inconsistent typing events.
- Recommendation: emit typing from controlled input change with debounce.

12. Route and auth typing has too much any usage.
- Files: multiple frontend/backend files
- Risk: hidden runtime bugs and poor refactor safety.
- Recommendation: tighten types for API payloads and context interfaces.

## Low

13. Debug logs and leftover commented blocks remain in production paths.
- File: backend/sockets/chat.socket.ts and others
- Recommendation: remove debug noise and use structured logger.

14. No tests configured in backend and no reliable integration tests in frontend.
- File: backend/package.json and frontend test setup absent
- Recommendation: add unit + integration + socket tests.

## Recommended Remediation Plan

Phase 1 (Security and Auth)
- Fix backend authenticate guards and error handling.
- Remove JWT fallback secret.
- Restrict CORS and Socket.IO origins.
- Fix ProtectedRoute logic.
- Refactor fetchWithAuth to use AuthContext setter, not mutation.

Phase 2 (Reliability and Scale)
- Move tokenMemory to database-backed token table.
- Batch user metadata lookup in message pipeline.
- Harden socket cleanup and event schema typing.

Phase 3 (Quality and Maintainability)
- Introduce test pyramid:
  - Backend unit tests for auth, messageServices, emojiServices.
  - API integration tests for routes.
  - Socket integration tests for message/reaction events.
  - Frontend component tests for ChatBox and MessageCard.
- Enforce lint/type rules to reduce any and dead code.

## Minimum Test Matrix to Add

Backend
- authenticate middleware: missing/invalid/valid token
- createMessage and getChannelMessages access control
- addReaction/removeReaction idempotency and permissions
- emoji upload permission and duplicate name handling

Frontend
- ProtectedRoute redirects unauthenticated users
- fetchWithAuth retry + refresh flow updates state
- ChatBox reaction sync for REST fallback and socket realtime
- ServerEmojiManager upload success/error states

E2E
- login -> open channel -> send message -> react -> refresh -> reactions still visible
- two-client realtime reaction propagation

## Notes

This review is static and does not replace runtime penetration testing, load testing, and full CI validation.
