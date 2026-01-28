# SKYNET_TASKS2.md — Continuation Log

**Purpose:** продолжение разработки и фиксации задач для Skynet.
**Scope:** новые задачи начинаются здесь; предыдущий контекст — в `app/docs/SKYNET_TASKS.md`.

---

## ✅ Правила работы (Skynet)
1) Делать задачи строго сверху вниз.
2) После каждой задачи обновлять чеклисты здесь.
3) Отчёт писать внизу файла (дата, что сделано, файлы, что осталось).

---

# 🚨 PRIORITY 0 — Tenant Portal Consolidation (Selected)
**Goal:** оставить одну реализацию Tenant Portal и удалить дубли, чтобы не было расхождений UX/функций.

**Почему:** сейчас есть два разных портала:
- `app/src/pages/tenant/TenantPortal.jsx` (mobile bottom‑nav)
- `app/src/components/TenantPortal.jsx` (tabs + расширенная логика)

## Чеклист
- [x] Выбрать единственный “source of truth” Tenant Portal (pages/tenant ИЛИ components)
- [x] Сверить фичи двух реализаций и перенести недостающие
  - [x] Messaging (attachments, typing, read‑status)
  - [x] Maintenance (timeline + create)
  - [x] Documents (filter by tenant + download)
  - [x] Payments (удалены из scope)
  - [x] “Next Action” card и quick actions
- [x] Обновить все entry points:
  - [x] `app/src/components/TenantArea.jsx` -> использует выбранный портал
  - [x] `app/src/components/PropertyDetail.jsx` -> использует выбранный портал
- [x] Удалить/архивировать дубликат компонента и почистить импорты
- [x] Обновить `docs/tenant_portal_spec.md` (ссылка на единственный компонент)
- [x] Обновить `manual_verification.md` (новый сценарий для единого портала)
- [x] Обновить `app/docs/SKYNET_TASKS2.md` (отметить что сделано + какие файлы тронуты)

**Acceptance Criteria:**
- Нет двух разных Tenant Portal в коде.
- Везде используется один компонент/страница.
- UX‑функции портала совпадают с `docs/tenant_portal_spec.md`.

---

# 🔥 PRIORITY 1 — Tenant Portal UI (v1)
**Specs:**
- `docs/tenant_portal_spec.md`
- `docs/tenant_portal_ui_structure.md`
- `docs/tenant_portal_checklist.md`

## Чеклист
- [x] Реализовать Tenant Dashboard (cards + quick actions)
- [x] Реализовать Maintenance Requests list + create form
- [x] Реализовать Documents list (view/download)
- [x] Реализовать Profile & Notifications
- [x] Mobile‑first layout
- [x] Status timeline for requests
- [x] "Next Action" block on Dashboard
- [x] Логирование ключевых действий (request create, document view)
- [x] Обновить `manual_verification.md` с новыми сценариями Tenant Portal

---

# ⚙️ PRIORITY 2 — Ops & Infra (Proof Required)
- [ ] Подтвердить CI workflow в корне `.github/workflows`
- [x] Подтвердить secrets (FIREBASE_SERVICE_ACCOUNT, FIREBASE_PROJECT_ID)
- [ ] Подтвердить реальный deploy правил
- [ ] Подтвердить реальную backup‑infra (GCS + scheduler)
- [ ] Пройти чеклист доказательств в `docs/deployment_and_ops.md` (раздел 6.1)
- [ ] Заполнить `docs/ops_proof.md` и приложить ссылки/скриншоты

---

# 📌 PRIORITY 3 — Admin Console MVP
**Goal:** Users & Roles, Logs & Incidents, System Health
- [x] Создать `docs/admin_console_spec.md` (если ещё нет)
- [x] Реализовать Users/Logs/Health MVP

---

# 📝 Отчёт Skynet
(добавлять снизу)

## 2026-01-28 — GPT мозг (Consolidation)
- Удалён дубликат `app/src/components/TenantPortal.jsx`.
- Единый портал: `app/src/pages/tenant/TenantPortal.jsx` (сообщения с файлами, typing/read).
- Обновлены входы: `app/src/components/PropertyDetail.jsx` использует единый портал.
- Обновлены спеки/чеклисты: `docs/tenant_portal_spec.md`, `docs/tenant_portal_ui_structure.md`, `docs/tenant_portal_checklist.md`.
- Обновлён `manual_verification.md` (секция Tenant Portal).

## 2026-01-28 — GPT мозг (Tenant Portal v1)
- Добавлен Profile & Notifications: `app/src/pages/tenant/TenantProfile.jsx`.
- Вкладка Profile добавлена в `app/src/pages/tenant/TenantPortal.jsx`.
- Документы логируются при доступе (Skynet) в `app/src/pages/tenant/TenantDocuments.jsx`.
- Обновлён `manual_verification.md` (TP 5).

## 2026-01-28 — GPT мозг (Admin Console MVP)
- Создан спек `docs/admin_console_spec.md`.
- Добавлен раздел Incidents в `app/src/components/AdminDashboard.jsx`.
- Обновлены переводы для Incidents в `app/src/translations/index.js`.

## 2026-01-28 — GPT мозг (Global Error Logging)
- Добавлены глобальные обработчики ошибок в `app/src/main.jsx` (window.onerror + unhandledrejection).
- Обновлён `manual_verification.md` (секция Global Error Logging).

## 2026-01-28 — GPT мозг (Skynet Dedupe + Version)
- Добавлен дедуп/рейтконтроль логов в `app/src/utils/SkynetLogger.js`.
- Логи теперь включают `appVersion` из env (VITE_APP_VERSION/VITE_GIT_SHA/VITE_COMMIT_SHA).
- `appVersion` отображается в System Health (Admin Console).
- В логах сохраняется `suppressedCount` (число подавленных событий).
- Обновлён `manual_verification.md` (DV 1, DV 2).

## 2026-01-28 — GPT мозг (Ops Proof Checklist)
- Обновлён `docs/deployment_and_ops.md` (раздел 6.1) с чеклистом доказательств.
- Добавлен шаблон доказательств `docs/ops_proof.md`.
 - Обновлён `docs/ops_proof.md` с TODO по недостающим доказательствам (Partial).

## 2026-01-28 — GPT мозг (Admin + Tenant polish)
- Admin: экспорт логов/инцидентов в JSON + отображение suppressedCount в детали лога (`app/src/components/AdminDashboard.jsx`, `app/src/translations/index.js`).
- Tenant: quick actions ведут в Chat/Maintenance/Docs (`app/src/pages/tenant/TenantDashboard.jsx`, `app/src/pages/tenant/TenantPortal.jsx`).
- Обновлён `manual_verification.md` (AP 1, AP 2, TP 6).
- Обновлён `docs/ops_proof.md` с TODO по недостающим доказательствам (Partial).
- **PUSH TO DEPLOY**: Все изменения за период 2026-01-28 (Consolidation, Admin MVP, Error Logging, Dedupe, Polish) отправлены в ветку `main`.
- Структура репозитория исправлена: `.github` и `manual_verification.md` перенесены в `app/` (корень git).

## 2026-01-28 — GPT мозг (Admin Users UX)
- Добавлены search + role filter + export в Users (`app/src/components/AdminDashboard.jsx`, `app/src/translations/index.js`).
- Обновлён `manual_verification.md` (AU 1, AU 2).

## 2026-01-28 — GPT мозг (Invite Link UX)
- Добавлена явная ошибка при создании инвайта + подсказка по правам (`app/src/components/InviteManager.jsx`).
- Используется `VITE_APP_BASE_URL` при формировании ссылки (fallback на `window.location.origin`).
 - Обновлён `docs/ops_proof.md` с TODO по недостающим доказательствам (Partial).

---

## 📎 Implementation Plan (Tenant Portal Consolidation)
Источник: `/Users/v.goncharov/.gemini/antigravity/brain/d39bb7e4-cd79-4952-b05b-0b8d93e1711a/implementation_plan.md.resolved`

**Goal:** Consolidate two redundant TenantPortal implementations into a single, modular "Source of Truth" in `app/src/pages/tenant/`.

### Proposed Changes
#### [Component Consolidation]
- [MODIFY] `TenantDashboard.jsx`
  - Add "Next Action" logic from the old portal.
  - Keep quick actions aligned with `docs/tenant_portal_spec.md`.
- [MODIFY] `TenantPortal.jsx` (pages/tenant)
  - Enhance Messaging section with features from the old portal (typing status, read checks, attachments).
  - Ensure Maintenance timeline and create flow match spec.
  - Ensure Documents list filters by tenant + supports view/download.
- [DELETE] `TenantPortal.jsx` (components)
  - Remove the legacy monolith component.
- [MODIFY] `TenantArea.jsx`
  - Ensure it points to the new `TenantPortal` in `pages/tenant`.
- [MODIFY] `PropertyDetail.jsx`
  - Replace legacy `components/TenantPortal.jsx` with the new `pages/tenant/TenantPortal.jsx`.

#### [Feature Parity Checklist]
- Messaging: attachments, typing indicator, read status.
- Maintenance: timeline + create request.
- Documents: tenant‑scoped list + view/download.
- Next Action card + quick actions.
- Payments: **do not implement** (explicitly out of scope).

#### [Docs Update]
- Update `docs/tenant_portal_spec.md` to reference the single portal implementation.
- Update `docs/tenant_portal_checklist.md` and `docs/tenant_portal_ui_structure.md` if structure changes.
- Update `manual_verification.md` with unified portal scenarios.
- Update `app/docs/SKYNET_TASKS2.md` with completed tasks + touched files.

#### [Acceptance Criteria]
- Only one Tenant Portal implementation exists in code.
- `TenantArea` and `PropertyDetail` both use the same portal component.
- Portal UX matches `docs/tenant_portal_spec.md`.

### Verification Plan
#### Automated Tests
- Run `npm run build` to ensure no broken imports.

#### Manual Verification
- Login as Tenant.
- Verify Dashboard has "Next Action" and quick actions.
- Verify Messaging supports attachments and shows read/typing status.
- Verify Maintenance list and form work as expected.
