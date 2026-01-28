# Ops Proof Pack (Fill & Attach Evidence)

## A) CI Workflow Proof (GitHub Actions)
- Workflow name: Deploy Firestore Rules
- Workflow Path: `.github/workflows/firestore-deploy.yml` (Fixed & Standardized)
- Latest run URL: 
- Run status: ☐ success ☐ failed
- Screenshot attached: ☐
 - TODO: Add GitHub Actions run URL + screenshot

## B) Secrets Proof (GitHub)
- Location: Settings → Secrets and variables → Actions
- FIREBASE_SERVICE_ACCOUNT present: [x] (Confirmed via user screenshot)
- FIREBASE_PROJECT_ID present: [x] (Confirmed via user screenshot)
- Screenshot attached (names only, values hidden): [x]

## C) Firestore Rules Deploy Proof
- Firebase Console → Firestore → Rules
- Last updated timestamp: 
- Screenshot attached: ☐
 - TODO: Add rules timestamp + screenshot

## D) Backup Infra Proof (GCS + Scheduler)
- Cloud Scheduler job name: `firestore-weekly-backup`
- Schedule (cron): `0 0 * * 0` (Weekly)
- Last run status: ☐ success ☐ failed (Needs verification after IAM update)
- Screenshot attached: ☐
 - TODO: Add scheduler status screenshot

- GCS bucket name: `lk-property-backups-2026` (asia-southeast1)
- Latest export folder/date: 
- Screenshot attached: ☐
 - TODO: Add bucket export screenshot + latest folder/date

## Notes
- CI Workflow moved from `app/.github` to project root for standard GitHub Actions detection.
- Secrets verified manually in conversation.
- IAM permissions for Firestore System Account pending final verification (Step 1713).
 - STATUS: Partial proof. Evidence missing for CI run URL, rules timestamp, scheduler status, and latest export.
