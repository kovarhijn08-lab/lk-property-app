# Deployment Handover Checklist (Production)

This is the single file to hand off to another LLM or operator.

## 1) Preconditions (One‑time setup)
1. **GitHub Secrets** (Repo → Settings → Secrets and variables → Actions)
   - `FIREBASE_SERVICE_ACCOUNT` = JSON service account (single‑line string).
   - `FIREBASE_PROJECT_ID` = `smart-pocket-ledger`.
2. **Vercel** is already connected to Git and deploys from `main` (root `app/`).
3. This environment has **no `vercel` or `firebase` CLI** installed.

## 2) Deploy Steps (Production)
1. Commit all changes:
   ```bash
   git status
   git add -A
   git commit -m "chore: security hardening + ops docs + firestore CI"
   ```
2. Push to `main` (triggers Vercel deploy + Firestore rules deploy):
   ```bash
   git push origin main
   ```

## 3) What deploys automatically
- **Frontend + API**: Vercel auto‑deploy on `main`.
- **Firestore Rules/Indexes**: GitHub Action `.github/workflows/firestore-deploy.yml`.
  - Triggered only when `firestore.rules`, `firestore.indexes.json`, or `firebase.json` changed.

## 4) Verification (Smoke Test)
1. Open production URL (Vercel).
2. Login as Admin.
3. Open Admin Dashboard.
4. Impersonate a Tenant.
5. Verify property list loads (checks indices).

## 5) Verify Rules Deployment
- GitHub Actions: workflow **Deploy Firestore Rules** is green.
- Firebase Console → Firestore Rules shows updated rules.

## 6) Notes / Known Limitations
- Firestore indexes are empty by default (`firestore.indexes.json`).
- Missing index errors should be created via Firebase Console links.
- Telegram alerts require server env: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

