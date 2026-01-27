# Deployment & Ops — Current State and Target

This document is the single source of truth for how deployments and operations should work.

## 1) Current Production Deployment (as‑is)
- **Frontend & API**: Auto‑deploy on `main` via Vercel + Git integration.
- **Root directory**: `app/`.
- **Firebase rules**: Manual copy‑paste from `firestore.rules` into Firebase Console.
- **CLI**: `vercel` and `firebase` CLI **not installed** in this environment.

## 2) Known Risks / Gaps
- Manual rules deployment can drift from repo state.
- No CI gates (lint/build/smoke) before `main` deploy.
- No staging/preview environment for rules or schema changes.
- No automated rollback or change audit for rules.

## 3) Target (Best‑Practice) State
- **IaC for Firebase**: `firebase.json` + `firestore.indexes.json` in repo.
- **CI‑based rules deploy** using a service account.
- **Branch protection**: PR checks must pass before merge to `main`.
- **Staging environment** for rules/index testing.
- **Release checklist** for prod changes.

## 4) Ordered Upgrade Plan (Do in this order)
1. Add `firebase.json` and `firestore.indexes.json` to repo.
2. Add GitHub Action to deploy Firestore rules/indexes on `main`.
3. Add CI checks: `npm run lint` + `npm run build`.
4. Add staging Firebase project for preview PRs.
5. Add release checklist to `docs/release_checklist.md`.

## 5) Required Inputs / Secrets
- `FIREBASE_SERVICE_ACCOUNT` (JSON string) in CI.
- `FIREBASE_PROJECT_ID` for prod and staging.
- Vercel env for frontend: `VITE_FIREBASE_*` and `TELEGRAM_*`.

## 6) CI Workflow (Implemented)
- GitHub Actions: `.github/workflows/firestore-deploy.yml`
- Triggers on changes to `firestore.rules`, `firestore.indexes.json`, or `firebase.json` in `main`.
- Uses `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID` secrets.

## 11) Backup & Export Policy (P1.4)
- **Schedule**: Weekly full Firestore export.
- **Responsibility**: Admin / PMC.
- **Storage**: Multi-provider (GDrive, S3, or physical encrypted drive).
- **Verification**: Restoration test must be performed **once a month**.
- **Execution**: 
  - Use `app/scripts/export_firestore.cjs`.
  - Ensure `FIREBASE_SERVICE_ACCOUNT` is set in the local/CI environment.
## 8) Observability & Auditing (P1.1)
- **Log Store**: Firestore `system_logs` collection.
- **Mandatory Fields**: 
  - `timestamp`: Unique ISO event time.
  - `createdAt`: Database server time (for reconciliation).
  - `actorId`: User ID or 'system'.
  - `action`: Dot-separated action name (e.g., `auth.login`, `db.update`).
  - `entityType` / `entityId`: Target resource (e.g., `property`, `user`).
  - `env`: Environment name (`production`, `development`).
  - `sessionId`: Persistent session identifier.
- **Reporting**: Logs are viewable in the **Admin Dashboard -> Global Logs**.
- **Alerts**: P0/Critical errors are automatically relayed to **Telegram** via `TelegramRelay`.

## 9) Incident Classification & Retention (P1.2)
- **Classification**:
  - **P0 (Critical/Crash)**: Instant alert via Telegram. Retention: **90 days**.
  - **P1 (Error)**: Daily audit required. Retention: **30 days**.
  - **P2 (Info/Warn)**: General observability. Retention: **30 days**.
- **Enforcement**:
  - Every log entry includes `priority` and `expiresAt` fields.
  - `expiresAt` is a Firestore-compatible Timestamp calculated at log time.

## 10) Retry/Backoff Policy (P1.3)
- **Automatic Retries**: Applied to all Firestore write operations (`set`, `update`, `delete`) and one-time reads (`get`, `list`).
- **Policy**:
  - **Attempts**: 3.
  - **Strategy**: Exponential backoff with jitter.
  - **Retryable Errors**: `unavailable`, `aborted`, `deadline-exceeded`, `resource-exhausted`.
- **User Notification**:
  - If an operation fails after 3 attempts, a structured log is recorded with `action: *.fail`.
  - The UI (App.jsx) displays an error Toast with the failure reason.
