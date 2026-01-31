# Project Map — Araya Home

This document is the canonical map of the project for handover to other LLMs or developers.

## 1) Top‑Level Structure
- `app/` — React (Vite) frontend + Vercel serverless API routes.
- `firestore.rules` — Firestore security rules (RBAC).
- `firebase.json` — Firebase config (rules + indexes).
- `firestore.indexes.json` — Firestore indexes (currently empty).
- `docs/` — Product and ops documentation.
- `directives/` — SOPs and system workflows.
- `execution/` — Deterministic scripts (if any).

## 2) Key Modules (Frontend)
- `app/src/context/AuthContext.jsx` — Auth, roles, Ghost Mode.
- `app/src/hooks/useFirestore.js` — Firestore CRUD + retry/backoff.
- `app/src/hooks/useProperties.js` — Role‑aware property access.
- `app/src/utils/SkynetLogger.js` — Structured logging + alerts.
- `app/src/components/ErrorBoundary.jsx` — Crash boundary.
- `app/src/components/ErrorMonitor.jsx` — Global error capture.

## 3) Serverless API
- `app/api/admin/update-user.js` — Admin user updates.
- `app/api/admin/set-password.js` — Admin password reset.
- `app/api/alerts/telegram.js` — Telegram alerts (server‑side secret).

## 4) Security & Roles
- Roles: `admin`, `pmc`, `owner`, `tenant`.
- Self‑role elevation is blocked by `firestore.rules`.
- Admin/PMC can impersonate users (Ghost Mode).

## 5) Logging & Self‑Healing
- Logging: Skynet Hub writes to `system_logs` with normalized metadata.
- Errors: Global capture + session correlation.
- Self‑healing: retry/backoff for transient Firestore failures.

## 6) Deployment
- Frontend: auto‑deploy on `main` via Vercel.
- Firestore rules: GitHub Action `.github/workflows/firestore-deploy.yml`.
- No local CLI in this environment.

## 7) Documentation Index
- `docs/product_spec_v1.md` — Product spec and NFRs.
- `docs/security_compliance_checklist.md` — Security checklist.
- `docs/deployment_and_ops.md` — Deployment process and target state.

## 8) Recent Changes (High‑Impact)
- P0 security hardening (rules, self‑signup roles).
- Server‑side Telegram alerts.
- Error/session correlation.
- Retry/backoff for Firestore operations.
- Properties fallback load on index/permission errors (prevents empty list after reload).
- Mobile overlay stacking fix (bottom nav no longer blocks drawers/modals).

## 9) Open Items
- Implement CI lint/build checks.
- Add staging Firebase project.
- Populate `firestore.indexes.json`.
