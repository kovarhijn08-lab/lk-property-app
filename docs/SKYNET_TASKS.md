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

---

## ✅ ПОРЯДОК РАБОТЫ (НЕ НАРУШАТЬ)
1. Выполнять задачи **строго сверху вниз**.
2. После каждого шага писать отчёт:
   - Что сделано
   - Какие файлы изменены
   - Что осталось

---

# ✅ P1 — Надёжность и наблюдаемость (очередь выполнения)

### P1.1 Сквозной аудит (единый формат логов)
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

### P1.2 Ошибки и инциденты (user + session)
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

### P1.3 Retry/Backoff
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

### P1.5 Минимальные e2e сценарии
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
- CLI в этом окружении нет.
- Фронтенд деплоится через push в `main` (Vercel).
- Firestore rules деплоятся GitHub Action.
- Всё подробно: `app/docs/deployment_handover_checklist.md`

