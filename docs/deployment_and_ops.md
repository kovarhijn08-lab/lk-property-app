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
