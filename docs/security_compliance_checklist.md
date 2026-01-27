# Security & Compliance Checklist

> Goal: enterprise‑grade security, auditability, and compliance readiness.

## 1) Access Control & RBAC
- [ ] Roles and permissions are defined in a single source of truth.
- [ ] No client‑side role changes (server‑side only).
- [ ] Admin actions are audited (who/what/when).
- [ ] Ghost Mode access is restricted, logged, and time‑boxed.
- [ ] Least‑privilege defaults for all new users.

## 2) Authentication & Sessions
- [ ] Password policy meets baseline security requirements.
- [ ] MFA enabled for admins/PMC (if supported by Firebase plan).
- [ ] Session/token rotation policy documented.
- [ ] Account lockout / brute‑force protection enabled.

## 3) Data Protection
- [ ] PII fields are documented and access‑scoped.
- [x] Sensitive data is never logged in plain text.
- [x] Data retention policy defined: P0 (90d), P1/P2 (30d) via `expiresAt` TTL.
- [ ] Export/delete requests (GDPR/CCPA) flow documented.

## 4) Firestore Rules & API Security
- [ ] Rules reviewed against all collections.
- [ ] Field‑level update restrictions enforced.
- [ ] Indexes reviewed and documented.
- [ ] API routes require admin tokens for privileged actions.

## 5) Observability & Logging
- [x] Structured logging with mandatory fields: `timestamp`, `severity`, `actorId`, `action`, `entityType`, `entityId`, `source`, `env`, `sessionId`.
- [x] Server-side logging to Firestore `system_logs` for all critical user and system actions.
- [ ] Alerting configured (Telegram/Email) for P0 incidents.
- [ ] Rate limiting on log ingestion.

## 6) Self‑Healing / Resilience
- [x] Retry/backoff on transient failures (3 attempts, exponential backoff implemented).
- [ ] Safe‑mode and degraded states documented.
- [ ] Auto‑repair scripts for known data anomalies.
- [ ] Circuit breakers for external integrations.

## 7) Infrastructure & Secrets
- [ ] All secrets stored in server env only.
- [ ] No secrets in client bundle (VITE_).
- [ ] Access to env vars restricted to admins.

## 8) Compliance Readiness
- [ ] GDPR/CCPA mapping completed.
- [ ] Audit report process documented.
- [ ] Data processing agreement template available (for enterprise).

## 9) Release & QA
- [ ] Security checklist reviewed per release.
- [ ] Dependency scanning in CI (npm audit / SCA).
- [ ] Pen‑test or threat model review scheduled.

