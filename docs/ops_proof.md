# Ops Proof Pack (Fill & Attach Evidence)

## A) CI Workflow Proof (GitHub Actions)
- Workflow name: Deploy Firestore Rules
- Workflow Path: `.github/workflows/firestore-deploy.yml` (Fixed & Standardized)
- Latest run URL: https://github.com/kovarhijn08-lab/lk-property-app/actions/runs/21508827707
- Run status: ☑ success ☐ failed
- Screenshot attached: ☐
 - TODO: Add GitHub Actions run URL + screenshot
 - How to verify:
   1) GitHub → Actions → “Deploy Firestore Rules”.
   2) Open latest run → copy URL.
   3) Сделайте скриншот страницы run с зелёной галочкой.

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
 - How to verify:
   1) Firebase Console → Firestore → Rules.
   2) Посмотрите “Last updated”.
   3) Сделайте скриншот с датой.

## D) Backup Infra Proof (GCS + Scheduler)
- Cloud Scheduler job name: `firestore-weekly-backup-pubsub`
- Target: Pub/Sub topic `firestore-weekly-backup`
- Schedule (cron): `0 0 * * 0` (Weekly)
- Last run status: ☑ success ☐ failed (Force run successful on 2026-01-30, ~21:17 GMT+7)
- Screenshot attached: ☐
 - TODO: Add scheduler status screenshot (success)
 - How to verify:
   1) GCP → Cloud Scheduler → job `firestore-weekly-backup-pubsub`.
   2) Откройте job → статус последнего запуска.
   3) Сделайте скриншот со статусом.

- GCS bucket name: `lk-property-backups-2026` (asia-southeast1)
- Latest export folder/date: 
- Screenshot attached: ☐
 - TODO: Add bucket export screenshot + latest folder/date
 - Notes: bucket list access for user pending (storage.objects.list).
 - How to verify:
   1) GCP → Cloud Storage → bucket `lk-property-backups-2026`.
   2) Откройте папку `exports/` и последнюю подпапку (дата).
   3) Сделайте скриншот списка объектов.

## Notes
- CI Workflow moved from `app/.github` to project root for standard GitHub Actions detection.
- Secrets verified manually in conversation.
- IAM permissions for Firestore System Account pending final verification (Step 1713).
 - STATUS: Partial proof. Evidence missing for CI run URL, rules timestamp, scheduler status, and latest export.
