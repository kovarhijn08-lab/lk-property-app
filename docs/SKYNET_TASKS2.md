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

# 🔐 PRIORITY 1.1 — Entry Points & Access Rules (post‑split)
**Goal:** закрепить разделение точек входа и разные правила доступа по ролям (Owner/PMC/Tenant).

**Specs:**
- `docs/entry_routes_spec.md`
- `docs/onboarding_spec.md`

## Чеклист
- [x] Tenant может регистрироваться **только по invite‑ссылке**.
  - [x] Любой, кто попал на `/tenant` без invite, видит экран‑объяснение “Запросите ссылку у владельца”.
- [x] Owner может **самостоятельно зарегистрироваться** (прямая регистрация).
  - [x] У Owner своя точка входа `/app` + очевидный CTA “Создать аккаунт владельца”.
- [x] PMC регистрируется **только по invite** от Admin/Owner.
  - [x] Для PMC отдельный invite‑flow и блокировка self‑signup.
- [x] Роль фиксируется на момент регистрации и не может быть подменена через UI.
- [x] Логика доступа синхронизирована с Firestore Rules (Auth UID/role).
- [x] Все ошибки доступа логируются в Skynet (Auth/Invite/Rules).
- [x] Обновить `manual_verification.md` (TR/AR сценарии доступа).

---

# 🧭 PRIORITY 1.2 — Product Strategy (World Practice)
**Goal:** зафиксировать продуктовую стратегию, UX‑референсы, метрики и политику AI‑помощника.

**Specs:**
- `docs/product_strategy_v1.md`

## Чеклист
- [x] Зафиксировать позиционирование и ICP (Owner 1–5 объектов, mixed аренда).
- [x] Зафиксировать эталоны UX (Guesty multi‑calendar + unified inbox + docs).
- [x] Зафиксировать v1 scope и out‑of‑scope (без платежей/каналов в v1).
- [x] Зафиксировать Aha‑моменты и тайминг активации.
- [x] Зафиксировать метрики и North Star.
- [x] Зафиксировать SLA 99.0% и список обязательных алертов.
- [x] Зафиксировать политику AI‑помощника (events + weekly fallback).
- [x] Зафиксировать мультивалютность (per‑property currency, default USD).
- [x] Предложить варианты нейминга (short, memorable) + выбрать Araya Home.

---

# 📄 PRIORITY 1.3 — Documents UX (v1)
**Goal:** быстрый ввод документов + категории + видимость в Legal Hub.

## Чеклист
- [x] Добавить категории документов (Lease/Act/Invoice/Receipt/Other).
- [x] Добавить поддержку Document Title для не‑lease документов.
- [x] Добавить file‑attach метаданные (fileName, fileSize).
- [x] Показать категорию/файл в списке Contracts.
- [x] Обновить Document Vault (фильтр + отображение).
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.

## Отложено (Real Storage)
- [ ] Реальная загрузка файлов в Storage (GCS/Firebase Storage).
- [ ] Ссылка на файл + предпросмотр (PDF/IMG) в Legal Hub.
- [ ] Политики доступа к файлам по ролям.

---

# 🚀 PRIORITY 1.4 — Onboarding UX Polish
**Goal:** упростить шаг 2 онбординга и учесть валюту объекта.

## Чеклист
- [x] Добавить выбор валюты на шаге 2 (USD/THB/AED/IDR/RUB).
- [x] Создавать объект в выбранной валюте.
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.

---

# 🤖 PRIORITY 1.5 — Assistant Coach (Global Dashboard)
**Goal:** показать Next Best Action и прогресс до первой ценности.

## Чеклист
- [x] Добавить карточку Araya Assistant на Global Dashboard.
- [x] Логика Next Action: объект → документы → бронирование → ready.
- [x] Прогресс‑бар First Value (%).
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.
- [x] Кнопка “Спросить ассистента” открывает чат (desktop).

---

# 🤖 PRIORITY 1.6 — Assistant Chat (Support Prompts)
**Goal:** быстрые подсказки в чате поддержки/assistant.

## Чеклист
- [x] Заголовок “Araya Assistant” для не‑админов.
- [x] Плашки‑подсказки (Add property / Invite tenant / Docs / Booking).
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.
- [x] Добавить блок “Quick guide / Быстрый гид” в пустом чате.

---

# 🧭 PRIORITY 1.7 — Owner Portal Quick Actions
**Goal:** 1‑клик доступ к ключевым действиям владельца.

## Чеклист
- [x] Пустое состояние + CTA “Add property”.
- [x] Quick actions (Add property / Open first property / Legal Hub).
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.

---

# 🧰 PRIORITY 1.8 — PMC Quick Actions
**Goal:** быстрый доступ PMC к календарю, бронированиям и документам.

## Чеклист
- [x] Добавить блок PMC Quick Actions на Global Dashboard.
- [x] Кнопки: Calendar / Booking / Docs / Chats.
- [x] Обновить `app/manual_verification.md` и `docs/manual_checklist.md`.

---

# 📚 PRIORITY 1.9 — Assistant Playbook
**Goal:** единые сценарии и ответы ассистента (v1).

## Чеклист
- [x] Создать `docs/assistant_playbook.md`.
- [x] Добавить ссылку в `docs/manual_checklist.md`.

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

## 2026-01-28 — GPT мозг (Invite Link UX & CI Fix)
- Исправлен `app/.github/workflows/firestore-deploy.yml`: удален префикс `app/` из путей, добавлен `--non-interactive`.
- Добавлен `app/.firebaserc` с явным указанием проекта `smart-pocket-ledger`.
- Обновлены `firestore.rules`: добавлен вайтлист по UID (`gXLLyfbt5...`), `isPMC` переведен на тернарные проверки для надежности.
- Добавлен `admintest@admin.ru` в белый список `AuthContext.jsx`.
- Добавлены правила для коллекции `typing` в `firestore.rules`.
- Добавлена явная ошибка при создании инвайта + подсказка по правам (`app/src/components/InviteManager.jsx`).
- Используется `VITE_APP_BASE_URL` при формировании ссылки.
- Обновлён `app/manual_verification.md` (INV 1, INV 2).
 - Обновлён `docs/ops_proof.md` с TODO по недостающим доказательствам (Partial).
- Добавлен индикатор прав/Ghost Mode и блокировка кнопки Invite (`app/src/components/InviteManager.jsx`).

## 2026-01-28 — GPT мозг (Admin + Tenant UX v2)
- Admin: добавлена кнопка Copy JSON в деталях лога (`app/src/components/AdminDashboard.jsx`, `app/src/translations/index.js`).
- Tenant: добавлена кнопка Next Action для перехода в Chat/Maintenance (`app/src/pages/tenant/TenantDashboard.jsx`).
- Обновлён `app/manual_verification.md` (AX 1, TX 1).

## 2026-01-28 — GPT мозг (Tenant Entry Routes)
- Разделены entry‑points: `/tenant` и `/app` (`app/src/App.jsx`).
- Invite‑link ведёт на `/tenant/signup?invite=...` (`app/src/components/InviteManager.jsx`).
- Логин скрывает Sign Up для `/tenant` без инвайта (`app/src/components/Login.jsx`).
- Обновлены проверки: `app/manual_verification.md` (TR 1, TR 2) и `docs/tenant_portal_spec.md`.

## 2026-01-28 — GPT мозг (Entry Routes Spec)
- Добавлен чеклист внедрения `docs/entry_routes_spec.md`.

## 2026-01-29 — GPT мозг (Skynet Phase 3 & Security Fixes)
- **Skynet Phase 3**: Реализован активный аудит через Firebase Functions (`app/functions/index.js`). 
- Добавлен Sentinel, который автоматически блокирует пользователя при 5+ инцидентах за 10 минут.
- **Security Fixes**: Обновлены `firestore.rules` (логи анонимов, чтение Property по Email). 
- Исправлено 8-секундное зависание в `AuthContext.jsx` при ошибках.

## 2026-01-29 — GPT мозг (Documents UX v1)
- Contracts: добавлены категории документов, поле Document Title для non‑lease, метаданные файла.
- Contracts: валютное отображение через property currency, fallback к USD.
- Document Vault: обновлён фильтр категорий и отображение (title, category, file name).
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/components/ContractList.jsx`, `app/src/components/DocumentVault.jsx`, `app/src/components/PropertyDetail.jsx`, `app/src/components/LegalHub.jsx`, `app/src/App.jsx`.

## 2026-01-29 — GPT мозг (Onboarding Currency)
- Onboarding Step 2: выбор валюты объекта (USD/THB/AED/IDR/RUB).
- Объект создаётся в выбранной валюте, плейсхолдер цены синхронизирован.
- Исправлен цветовой стиль кнопки (self‑managed).
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутый файл: `app/src/components/Onboarding.jsx`.

## 2026-01-29 — GPT мозг (Assistant Coach)
- Добавлена карточка Araya Assistant на Global Dashboard с Next Best Action.
- Логика шагов: объект → документы → бронирование → ready.
- Добавлен прогресс‑бар First Value (%).
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/components/GlobalDashboard.jsx`, `app/src/translations/index.js`.

## 2026-01-29 — GPT мозг (Assistant Chat + Owner Portal)
- SupportChat: быстрые подсказки (chips) + заголовок Araya Assistant для не‑админов.
- Owner Portal: Quick actions + пустое состояние для первого объекта.
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Обновлён `docs/ops_proof.md` с пошаговой инструкцией сбора доказательств.
- Затронутые файлы: `app/src/components/SupportChat.jsx`, `app/src/components/OwnerPortal.jsx`, `app/src/App.jsx`, `app/src/translations/index.js`, `app/docs/ops_proof.md`.

## 2026-01-29 — GPT мозг (Assistant Guide)
- SupportChat: добавлен блок “Quick guide / Быстрый гид” для пустого чата.
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/components/SupportChat.jsx`, `app/src/translations/index.js`.

## 2026-01-29 — GPT мозг (Assistant Entry Point)
- Global Dashboard + Owner Portal: добавлена кнопка “Спросить ассистента”.
- Desktop: открывается виджет SupportChat.
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/App.jsx`, `app/src/components/GlobalDashboard.jsx`, `app/src/components/OwnerPortal.jsx`, `app/src/translations/index.js`.

## 2026-01-29 — GPT мозг (PMC Quick Actions)
- Global Dashboard: блок “PMC Quick Actions” с кнопками Calendar/Booking/Docs/Chats.
- Обновлены чеклисты: `app/manual_verification.md`, `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/components/GlobalDashboard.jsx`, `app/src/App.jsx`, `app/src/translations/index.js`.

## 2026-01-29 — GPT мозг (PMC Booking Flow)
- Кнопка PMC Booking теперь открывает форму бронирования (если есть STR объект), иначе календарь.
- Обновлены чеклисты: `docs/manual_checklist.md`.
- Затронутые файлы: `app/src/App.jsx`Проанализируй весь наш продукт что это и какой у него функционал, `app/src/components/GlobalDashboard.jsx`, `app/src/components/PropertyDetail.jsx`.

## 2026-01-29 — GPT мозг (Assistant Playbook)
- Создан сценарийный документ `docs/assistant_playbook.md`.
- Обновлён чеклист: `docs/manual_checklist.md` (ссылка на playbook).

## 2026-01-29 — GPT мозг (Chats Navigation)
- NavigationDrawer: добавлен пункт “Чаты”.
- Обновлены чеклисты: `docs/manual_checklist.md`, `app/manual_verification.md`.
- Затронутые файлы: `app/src/components/NavigationDrawer.jsx`, `app/src/App.jsx`, `app/src/translations/index.js`.
- Улучшен роутинг: `/tenant` и `/app` теперь управляют `targetRole` и режимом отображения Login/Signup.

## 2026-01-29 — GPT мозг (Product Strategy v1)
- Создан документ стратегии `docs/product_strategy_v1.md` (позиционирование, роли, v1 scope, метрики, SLA, AI‑помощник, мультивалюта).
- Зафиксированы UX‑референсы Guesty (calendar/inbox/docs).
- Добавлен список неймингов (shortlist) для выбора.

## 2026-01-29 — GPT мозг (Brand: Araya Home)
- Обновлён бренд в UI и ключевых docs на **Araya Home**.
- Создан `docs/brand_guide.md`.
- Добавлен официальный слоган и обновлён онбординг/логин‑copy.

## 2026-01-29 — GPT мозг (Entry Rules Step 1)
- Tenant invite‑only notice добавлено в логине (`app/src/components/Login.jsx`).
- PMC self‑signup заблокирован (UI + guard в `app/src/components/SignUp.jsx`, `app/src/context/AuthContext.jsx`).
- Обновлён `app/src/components/LoginHub.jsx` (notice).
- Обновлён `app/manual_verification.md` (TR 3–TR 4).

## 2026-01-29 — GPT мозг (PMC Invite Flow)
- Добавлен PMC invite‑flow в `app/src/components/InviteManager.jsx` (role‑aware invites).
- Добавлена выдача PMC инвайта в карточке объекта (`app/src/components/PropertyDetail.jsx`).
- В `app/src/App.jsx` и `app/src/components/SignUp.jsx` учтён invite‑role.
- Усилен signup: роль берётся из инвайта, PMC invite‑only (`app/src/context/AuthContext.jsx`).
- Обновлены правила `app/firestore.rules` для роли инвайта.
- Обновлён `app/manual_verification.md` (INV 3).

## 2026-01-29 — GPT мозг (Access Error Logging)
- Добавлено логирование `db.access.denied` для Firestore операций (`app/src/hooks/useFirestore.js`).
- Добавлены auth/invite блокировки в логи (AuthContext + InviteManager).
- Обновлён `app/manual_verification.md` (AE 1).

## 2026-01-29 — GPT мозг (Role Immutability)
- Запрещены изменения пользователей PMС‑ролью на уровне правил (`app/firestore.rules`).
- В Admin Console изменение роли доступно только Admin (`app/src/components/AdminDashboard.jsx`).
- Обновлён `app/manual_verification.md` (AU 3).

## 2026-01-29 — GPT мозг (Currency + Onboarding Lock)
- Добавлен выбор валюты при создании объекта (`app/src/components/AddPropertyForm.jsx`).
- Валюта объекта фиксируется и отображается в карточке (`app/src/components/PropertyDetail.jsx`).
- Онбординг блокирует смену роли, если роль уже задана (`app/src/components/Onboarding.jsx`).
- Обновлены чеклисты: `docs/manual_checklist.md`, `app/manual_verification.md`.

## 2026-01-29 — GPT мозг (Home UX + Quick Start)
- Обновлён бренд в мобильном заголовке дашборда (`app/src/components/GlobalDashboard.jsx`).
- Добавлен Quick Start (Aha) блок для Owner/PMC.
- Валюта отображается в списке объектов и доходах.
- Обновлены чеклисты: `docs/manual_checklist.md`, `app/manual_verification.md`.

## 2026-01-29 — GPT мозг (Create Property UX)
- Добавлен advanced‑toggle и optional поля Monthly Income / Expenses (`app/src/components/AddPropertyForm.jsx`).
- Добавлен Quick Start hint в форме Add Property.
- Обновлены чеклисты: `docs/manual_checklist.md`, `app/manual_verification.md`.

## 2026-01-29 — GPT мозг (Booking UX)
- Добавлен Summary блок (валюта, ночи, депозит) и disabled‑submit при незаполненных полях (`app/src/components/BookingForm.jsx`).
- Обновлены чеклисты: `docs/manual_checklist.md`, `app/manual_verification.md`.

## 2026-01-29 — GPT мозг (Rules + Manual Checklist)
- Усилены правила `/users` для PMC invite‑only (`app/firestore.rules`).
- Добавлен быстрый чеклист для владельца: `docs/manual_checklist.md`.

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
