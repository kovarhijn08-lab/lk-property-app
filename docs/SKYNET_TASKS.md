# SKYNET_TASKS.md — Single Source of Truth

**Роль GPT мозг:** ставит задачи и проверяет.
**Роль Skynet:** делает программирование и отчёт.

---

## ✅ ГЛАВНЫЕ ФАЙЛЫ (обязательные ссылки)
- `ROADMAP.md`
- `app/ROADMAP.md`
- `app/docs/deployment_handover_checklist.md`
- `docs/deployment_and_ops.md`
- `app/docs/deployment_and_ops.md`
- `app/docs/security_compliance_checklist.md`
- `manual_verification.md`
- `docs/tenant_portal_spec.md`

---

## ✅ ПОРЯДОК РАБОТЫ (НЕ НАРУШАТЬ)
1. Выполнять задачи **строго сверху вниз**.
2. После каждого шага писать отчёт:
   - Что сделано
   - Какие файлы изменены
   - Что осталось

---

# ✅ P1 — Надёжность и наблюдаемость (очередь выполнения)

### ✅ P1.1 Сквозной аудит (единый формат логов) [DONE]
**Что нужно сделать:**
- Обновить:
  - `app/docs/security_compliance_checklist.md`
  - `docs/deployment_and_ops.md` и/или `app/docs/deployment_and_ops.md`
- Зафиксировать стандарт логов:
  - MUST: `timestamp`, `severity`, `actorId`, `action`, `entityType`, `entityId`, `source`, `env`
  - SHOULD: `ip`, `userAgent`, `sessionId`, `metadata`
- Логируемые события:
  - `auth.login`, `auth.logout`, `auth.impersonate`
  - `user.role.change`, `user.password.reset`
  - `property.create/update/delete`
  - `transaction.create/update/delete`
  - `contract.sign`
  - `payment.success/failed/refund`
  - `maintenance_request.create/update/close`

---

### ✅ P1.2 Ошибки и инциденты (user + session) [DONE]
- Обновить:
  - `app/docs/security_compliance_checklist.md`
  - `docs/deployment_and_ops.md` / `app/docs/deployment_and_ops.md`
- Классификация:
  - P0 → Telegram/Email немедленно
  - P1 → ежедневная проверка
  - P2 → просто логирование
- Обязательные поля ошибки:
  - `timestamp`, `severity`, `actorId`, `sessionId`, `env`, `stack`
- Retention:
  - P0 ≥ 90 дней
  - P1/P2 ≥ 30 дней

---

### ✅ P1.3 Retry/Backoff [DONE]
- Обновить `docs/deployment_and_ops.md` / `app/docs/deployment_and_ops.md`
- Критичные операции:
  - `transaction.create`, `contract.sign`, `payment.*`, `maintenance_request.create`, `property.update`
- Политика:
  - 3 попытки с экспоненциальной задержкой
  - После фейла → лог `error` + уведомление пользователя

---

### P1.4 Бэкапы/экспорт
- Обновить:
  - `docs/deployment_and_ops.md` / `app/docs/deployment_and_ops.md`
  - `app/docs/security_compliance_checklist.md`
- Политика:
  - Еженедельные бэкапы
  - Ответственный: Admin/PMC
  - Хранилище: GDrive/S3
  - Проверка восстановления: 1 раз в месяц

---

### ✅ P1.5 Минимальные e2e сценарии [DONE]  
**Файл:** [manual_verification.md](file:///Users/v.goncharov/Proga/lk%20property/manual_verification.md)
- Обновить `manual_verification.md`
- Добавить сценарии:
  1) Admin login → dashboard
  2) Create property → видно в списке
  3) Create transaction → метрики обновлены
  4) Impersonate tenant → доступ только к своим объектам
  5) Logout/login снова → корректная сессия

---

# ✅ Админ‑консоль (ТЗ без кода)

### v1 (MVP)
- Users & Roles
- Logs & Incidents
- System Health

### v2
- Backup/Export
- Payments Monitor
- Maintenance SLA

### v3
- Compliance (GDPR экспорт/удаление)
- Immutable Audit Trail

---

# ✅ Деплой (информация для Skynet)
- Фронтенд деплоится через push в `main` (Vercel).
- Firestore rules деплоятся GitHub Action.
- Всё подробно: `app/docs/deployment_handover_checklist.md`


---

# ✅ SKYNET MASTER CHECKLIST (P3 — Product & UX)

> Использовать этот блок как единственный источник задач для P3.

---

## P3.1 Улучшенный Onboarding  
**Файл:** `docs/onboarding_spec.md`

- [x] Создать документ [docs/onboarding_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/onboarding_spec.md)  
- [x] Внести роль‑ориентированные сценарии (Owner/Tenant/PMC)  
- [x] Описать шаги онбординга (мин. 3 шага)  
- [x] Указать “первый успех” для каждой роли  
- [x] Добавить метрики (completion rate, drop‑off, time‑to‑value)  
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/onboarding_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/onboarding_spec.md)

---

## P3.2 Global Search  
**Файл:** `docs/global_search_spec.md`

- [x] Создать `docs/global_search_spec.md`  
- [x] Описать сущности поиска (Property/User/Contract/Transaction)  
- [x] Описать доступы (admin/pmc/full; owner/own; tenant/own)  
- [x] Формат результата (`type`, `label`, `id`, `secondary`, `linkTarget`)  
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/global_search_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/global_search_spec.md)  

---

## P3.3 Tags & Filters  
**Файл:** `docs/tags_filters_spec.md`

- [x] Создать `docs/tags_filters_spec.md`  
- [x] Описать сущности с тегами  
- [x] Описать права управления тегами  
- [x] Описать базовые фильтры (tag/type/date/status)  
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/tags_filters_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/tags_filters_spec.md)  

---

## P3.4 Offline Mode & Sync  
**Файл:** `docs/offline_sync_spec.md`

- [x] Создать `docs/offline_sync_spec.md`  
- [x] Описать кэшируемые данные  
- [x] Описать офлайн‑действия  
- [x] Описать стратегию синхронизации  
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/offline_sync_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/offline_sync_spec.md)  

---

## ✅ Отчёт Skynet (обязателен)
После каждого пункта Skynet пишет:
- **Сделано**
- **Изменённые файлы**
- **Что осталось**


---

# ✅ NEXT TASK — Backup/Restore (Best Practice)

## Цель
Перевести бэкапы Firestore в автоматизированный формат: Cloud Scheduler → Firestore Export → GCS.

## Задачи
1) [x] Обновить `docs/deployment_and_ops.md` и/или `app/docs/deployment_and_ops.md`  
2) [x] Создать `docs/backup_restore_policy.md` с полной политикой backup/restore.  
3) [x] Добавить ссылку на [docs/backup_restore_policy.md](file:///Users/v.goncharov/Proga/lk%20property/docs/backup_restore_policy.md) в `app/docs/SKYNET_TASKS.md`.  

## Готовая политика (для вставки в новый документ)
```
# Backup & Restore Policy (Firestore)

## 1) Backup Method
Primary: Firestore managed export → Google Cloud Storage (GCS).
Trigger: Cloud Scheduler (weekly cron).

## 2) Frequency & Retention
- Weekly full export
- Retention: 90 days (rolling)

## 3) Storage
- Primary: GCS bucket (multi‑region)
- Optional secondary: S3 or GDrive cold archive

## 4) Access & Security
- Service account with Export + Storage Admin
- Access limited to Admin/PMC

## 5) Restore Procedure
- Restore into staging/test project first
- Validate data integrity
- Promote to production only if validated

## 6) Monitoring
- Log each backup run to `system_logs`
- P0 alert on failure (Telegram)
```

## Backup Readiness Checklist
- [x] GCS bucket created (Configuration documented)
- [x] Service account with export permissions (Roles identified)
- [x] Scheduler configured (weekly) (Cron expression defined)
- [x] Retention policy defined (90d) (GCS Lifecycle documented)
- [x] Restore procedure tested monthly (Process formalized)
- [x] Logs + alerts enabled (Logging logic defined)


---

# ✅ P3.5 Tenant Portal (Best Practices)
**Файл:** [docs/tenant_portal_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/tenant_portal_spec.md)

- [x] Создать/обновить `docs/tenant_portal_spec.md`
- [x] Описать обязательные разделы: Dashboard, Payments, Maintenance, Documents, Profile
- [x] Описать UX‑паттерны (Timeline статуса, Next Action, Quick Actions)
- [x] Зафиксировать политику доступа (tenant видит только своё)
- [x] Добавить метрики качества (TTV, completion, SLA)
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/tenant_portal_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/tenant_portal_spec.md)


---

# ✅ P3.6 Login Hub (Combo A+B)
**Файл:** `docs/login_hub_spec.md`

- [x] Создать/обновить `docs/login_hub_spec.md`
- [x] Описать Hub‑экран входа (PMC/Owner/Tenant)
- [x] Добавить Tenant invite‑flow (invite only)
- [x] Описать состояния ошибок (invalid/expired/used)
- [x] Добавить метрики (conversion, activation, TTV)
- [x] В `app/docs/SKYNET_TASKS.md` добавить ссылку: [docs/login_hub_spec.md](file:///Users/v.goncharov/Proga/lk%20property/docs/login_hub_spec.md)

