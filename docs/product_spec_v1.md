# Product Spec v1 — Smart Pocket Ledger

## 1. Mission
Create the most reliable and transparent property management platform for owners, tenants, and PMCs worldwide, with real‑time visibility, automation, and audit‑grade accountability.

## 2. Target Personas
- **PMC Operator**: manages multiple owners/units, needs bulk control, auditability, and SLA tracking.
- **Owner/Investor**: wants clear ROI, cashflow, and compliance reports.
- **Tenant**: wants fast issue resolution, clear billing, and easy communication.

## 3. Core Value Propositions
- **Single Source of Truth** for all properties, finances, and contracts.
- **Automated Operations** (rent collection, reminders, reporting).
- **Trust & Auditability** (immutable logs, role‑based access).
- **Global Readiness** (multi‑currency, multi‑region compliance).

## 4. Key Outcomes (KPIs)
- Time‑to‑first‑value: < 10 minutes.
- Monthly active owners and PMCs.
- Payment success rate and delinquency reduction.
- Ticket resolution time (maintenance).
- Data integrity issues detected vs auto‑resolved.

## 5. Scope
### Now (Core)
- Portfolio management: properties, units, contracts.
- Financial tracking: transactions, cashflow, reports.
- Communication: chat, notifications, tasks.
- Roles: admin/pmc/owner/tenant with Ghost Mode.

### Next (Expansion)
- Payments: Stripe + webhooks with automated reconciliation.
- Integrations: banking, STR channels, e‑signature.
- Mobile: offline‑first workflows.

## 6. Non‑Functional Requirements (NFRs)
- **Best‑in‑class logging**: centralized, queryable, auditable, structured logs.
- **Self‑healing system**: automatic recovery for common failures (retry/backoff, safe‑mode, auto‑repair scripts, circuit breakers).
- **Security**: zero client‑side role elevation, audited admin actions, data minimization.
- **Reliability**: graceful degradation (safe‑mode), offline cache where possible.
- **Performance**: fast dashboards (<2s for core screens on median device).

## 7. Platform Principles
- **Deterministic core**: move critical logic to serverless/tools.
- **Predictable data model**: versioned schema and safe migrations.
- **Observability first**: every critical flow emits a traceable event.

## 8. Data Model (High‑Level)
- Organization (PMC) → Owners → Properties → Units
- Users (roles, preferences)
- Transactions, Contracts, Maintenance Requests
- Messages, Notifications, System Logs

## 9. UX Principles
- Clarity > density; prioritize decisions over raw data.
- One‑screen answers for owners (ROI, cashflow, issues).
- Mobile‑first task completion.

## 10. Risks & Mitigations
- Role escalation → strict rules + server validation.
- Log spam / noise → rate limiting + severity gating.
- Data drift → diagnostics + auto‑repair.

## 11. Open Questions
- Final pricing tiers and limits per plan.
- Required compliance standards per region (GDPR/CCPA).
- SLA commitments for PMCs and enterprise clients.

