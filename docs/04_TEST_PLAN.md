# 04 — Test Plan: Samadhan

## 1. Test pyramid and tooling
| Layer | Tool | Scope | Gate |
|---|---|---|---|
| Unit | Vitest | `packages/domain` rules, utilities, adapters with mocks | ≥ 90% lines (domain) |
| Integration | Vitest + Testcontainers (Postgres/PostGIS, Redis, MinIO) | API routes, repositories, RLS, schedulers, outbox | Every route: happy path, unauthenticated, out-of-scope, validation error |
| RLS matrix | Custom runner | Every table × every role × own/other tenant × in/out of scope | 100% of tables |
| Contract | Vitest + provider sandboxes (nightly) | Adapter real implementations vs mocks | Nightly green or ticket |
| E2E web | Playwright | Critical journeys on staff web and citizen PWA | Smoke on every PR; full nightly and before release |
| E2E mobile | Maestro | Staff and citizen app flows incl. offline | Before release |
| Accessibility | axe-core (Playwright + Storybook) | Every screen | Zero serious/critical issues |
| Performance | Lighthouse CI; k6 | PWA budgets; API/webhook/voice load | Lighthouse ≥ 85; Architecture §15 targets |
| Security | Semgrep, Trivy, gitleaks, pnpm audit, ZAP baseline | Code, images, secrets, deps, running app | No high/critical |
| AI evaluation | `pnpm test:ai-eval` | Intake accuracy, latency, cost | Thresholds in §3 |
| Resilience | Scripts | Worker kill mid-job, Redis restart, provider outage, DB failover | Expected recovery, no duplicates |
| Usability | Moderated field sessions | Citizens and field staff | §4 |

**Test data:** factories in `packages/db/test/factories`; deterministic seeds; time control via an injectable clock (never `Date.now()` in domain code).

## 2. Mandatory unit test sets (domain)
- **State machine:** every allowed transition, every forbidden transition, every guard.
- **Routing:** each assignment mode; availability (leave, shift, demobilised); temporary charges; least-loaded and round-robin; fallback.
- **SLA:** hours vs days; working hours across nights, weekends and holidays; timezone boundaries; DST-free IST; pause/resume for hold.
- **Escalation:** each trigger basis; mixed bases; 7 levels; notify-only; ordering validation; EOT shift recompute; idempotency.
- **Feedback:** reopen window boundaries (29:59 vs 30:01), one-level-up resolution, no-response task.
- **Clustering:** radius/window boundaries.
- **Photo checks:** EXIF age, distance thresholds, pHash Hamming threshold, missing EXIF.
- **Penalty:** fixed, per-day, cap.
- **Spam:** rate limits and blocklist.
- **Authorisation:** evaluation order permutations (module off, permission missing, scope miss, right missing, state forbids).
- **Settings:** precedence.
- **Vocabulary:** resolution order.
- **GST:** intra-state vs inter-state, rounding.

## 3. AI evaluation thresholds (per tenant and language; block auto-routing if unmet)
- Golden set: at least 300 utterances per language for the pilot region (recorded with consent, real dialects, noisy conditions included), labelled with intent, sub-type and node.
- **Intent accuracy ≥ 95%.**
- **Sub-type top-1 ≥ 85%, top-3 ≥ 95%.**
- **Node accuracy ≥ 80%** (when a place name is spoken).
- Median turns per registration ≤ 3.
- Voice note turn p95 ≤ 4 s; phone response p95 ≤ 1.5 s.
- Hallucinated IDs (not in the provided lists) = 0 (hard fail).
- Prompt/model changes require an eval run with no metric regressing more than 2 points.
- If thresholds are unmet, the tenant setting `ai_auto_routing` stays off: AI suggests and agents confirm.

## 4. Usability gate (citizen and field staff)
- 15–20 participants per pilot region, including people who cannot read the script.
- **Tasks:** register by voice; register by pictures; add a photo; check status; give feedback. Field staff: accept a task and submit an ATR with a photo.
- **Pass:** ≥ 80% complete each task unaided; median time to register ≤ 2 minutes; zero critical confusion points left unfixed.
- Record findings in `docs/reports/usability-round-N.md`.

## 5. Acceptance tests (AT)
Each AT has an automated test (integration or E2E) named `AT-xx …` plus, where noted, a manual check.

**Platform, IAM, configuration**
- **AT-01 Tenant isolation:** a user of tenant A cannot read, search, export, receive notifications about, or fetch by direct ID any tenant B data, through the API, realtime channels, reports or Metabase embeds.
- **AT-02 Entitlements:** disabling `whatsapp_bot` hides its UI, rejects its API routes for that tenant, stops webhook processing for that tenant's number, and notifications fall back to SMS without errors.
- **AT-03 Permissions and scopes:** a custom role cloned from `officer` cannot include permissions of unlicensed modules. A node-scoped officer sees only their subtree. `citizen.pii.view` absent → phone numbers masked in API responses and exports.
- **AT-04 Onboarding:** applying `rural_v1` plus the sample Excel set to a new tenant yields a Health Check with zero errors. Invalid rows produce a downloadable validation report and nothing partial is applied.
- **AT-05 Routing Simulator:** for 20 seeded node × sub-type combinations, the simulator's assignee, due time, escalation dates and approvers equal those produced by real case registration.
- **AT-06 Vocabulary:** the urban tenant shows Zone/Ward and the rural tenant shows Block/Gram Panchayat/Village on identical screens; a label override applies to one tenant only.

**Case engine**
- **AT-07 Vendor auto and acceptance:** "Streetlight not working" in Ward 12 is assigned to the vendor technician covering Ward 12. No acceptance in 10 minutes → supervisor notified and an outbound follow-up task created.
- **AT-08 EOT:** a 2-day EOT approved by the configured approver shifts the due date and all escalation times by 2 days; a rejection keeps the original. The max-extension limit is enforced.
- **AT-09 ATR multi-level:** an ATR without a camera photo is rejected. A photo 600 m away is flagged. L1 returns it; it is resubmitted; L1 and L2 approve → RESOLVED → feedback requested.
- **AT-10 Escalation bases:** sub-types configured with `pct_of_sla` (50/100/150/200), `after_sla` (+1 d, +3 d), `from_registration` (20 min, 30 min) and a notify-only MIS level all escalate at the exact computed times (clock-controlled). A scheduler re-run creates no duplicate escalations or notifications.
- **AT-11 Feedback rules:** negative at 10 minutes → auto-reopen to the same owner. Negative at 2 hours → ATR task to the officer one level up, whose positive result closes and negative result reopens. No response → agent callback task. The IVR feedback call is never placed outside the configured window.
- **AT-12 Edit and transfer:** a sub-type edit re-routes with the new SLA and approvers. A cross-department transfer requires approval and applies each SLA policy option correctly. History is preserved.
- **AT-13 On hold:** an approved hold pauses SLA only where allowed and appears in the On-hold queue and reports; resume restores timers.
- **AT-14 Clustering:** a second identical-sub-type complaint within radius and window becomes a supporter; all supporters are notified on resolution.
- **AT-15 Availability and fallback:** a worker on leave is skipped; with no eligible assignee the case goes to the node default officer flagged `ROUTING_FAILED` and the nodal officer is alerted.
- **AT-16 People and hierarchy changes:** transferring an officer hands their open cases to the successor per the selected policy. Moving an area to another ward re-routes its open, unassigned cases. Everything is audited.
- **AT-17 Spam and priority:** exceeding the per-phone limit blocks registration with a polite message. "Mark fake" with approval rejects the case and counts toward the blocklist threshold. A senior-citizen case gets priority routing and the SLA multiplier.

**Messaging**
- **AT-18 Notification matrix:** for every event, recipients and channels match the rules. WhatsApp failure falls back to SMS. Quiet hours defer non-emergency citizen messages. Delivery receipts are stored with cost.
- **AT-19 Broadcast:** an active water outage notice in Village Rampur is shown and spoken to a citizen starting a water complaint there; continuing links the complaint to the broadcast.

**Citizen**
- **AT-20 Picture flow:** a user completes registration with pictures only, hears the case number, and can replay it; works at 360 px on throttled 3G.
- **AT-21 QR flow:** scanning a handpump QR registers a complaint with asset and location prefilled and zero typing.
- **AT-22 Public dashboard:** shows aggregates and rankings only; an automated scan finds no phone numbers, names or exact citizen coordinates.
- **AT-23 Kiosk, elected rep, Gram Sabha:** the kiosk prints a token slip and resets after idle. An elected rep sees only their nodes. A Gram Sabha meeting report lists the meeting's complaints with current status.

**Voice and WhatsApp**
- **AT-24 Voice in app:** spoken Hindi complaint → ≤ 3 turns → read-back → registered → number spoken → photo requested.
- **AT-25 WhatsApp voice note:** "Hamare gaon Rampur mein handpump teen din se kharab hai" registers "Handpump not working" in Village Rampur. A shared location maps to the correct node by polygon.
- **AT-26 Low confidence:** "kuch problem hai" ends as `NEEDS_CLASSIFICATION` with audio, transcript and top-3 suggestions; the agent classifies and normal routing continues.
- **AT-27 Phone voice:** a streaming call registers a complaint; barge-in stops TTS; pressing 0 transfers to an agent or creates a callback task; the recording is stored; 50 concurrent calls meet the latency target in staging (or a documented provider limit).
- **AT-28 WhatsApp bot:** every menu path works in each enabled language; "Talk to person" opens a live chat in the agent inbox; outside the 24-hour window only approved templates are sent.
- **AT-29 Field WhatsApp:** Accept → Need more time (EOT request) → Done → photo + location → ATR created with photo checks.
- **AT-30 Impersonation:** a platform support user's impersonation requires a reason, shows a banner, is time-boxed, and every action appears in the tenant's audit log; the tenant admin is notified (if the setting is on).
- **AT-31 Missed call and inbound SMS:** a missed call triggers a callback within the configured minutes. `STS <no>` returns status. A valid short code creates a case; an unknown code replies with help.
- **AT-32 Knowledge bot:** answers come only from the tenant knowledge base with source shown to the agent. A question outside the KB gets "I'll connect you" and an agent task.

**Mobile, workforce, vendors**
- **AT-33 Offline ATR:** in airplane mode a field worker accepts and records an ATR with photos; on reconnect it syncs with original capture time and GPS. If the case changed server-side, the user gets a clear message and nothing is silently lost.
- **AT-34 Workforce:** attendance check-in outside the GPS radius is flagged. A shift end removes the worker from auto-routing. FRT self-registration needs approval before the account can receive tasks.
- **AT-35 Vendor portal:** a vendor admin sees only their vendor's staff, tasks, performance and penalties. A contract-expiry alert fires 30 days ahead. An expired contract blocks new auto-assignments (setting).
- **AT-36 Penalties:** an SLA breach on a penalty-enabled sub-type creates a penalty entry by rule; approval/waiver is recorded; the export totals match the ledger.

**Agents, QC, social, integrations**
- **AT-37 Agent console:** an incoming call pops the caller's history. An enquiry is logged and counted in the enquiry report. Callback and classification queues work with dispositions.
- **AT-38 QC:** a scheduled QC task reaches the auditor; the score with audio goes to the supervisor; remarks are added; the final score is visible to the manager and agent. AI auto-scores appear for all calls.
- **AT-39 Social inbox:** mentions or comments from each connected platform appear with prior thread history; all eight actions work; convert-to-case enters normal workflow; the reply is posted (sandbox/mock).
- **AT-40 E-mail:** an inbound e-mail lands in the control room threaded; actions work; the reply is sent from the tenant sender.
- **AT-41 Integration two-way:** a case created by the state-portal connector appears in the platform; status updates flow back; a simulated outage is retried and appears in the reconciliation report.
- **AT-42 Public API and webhooks:** an API key with `case.read` scope cannot create cases; rate limits apply; outbound webhooks are signed and retried.

**Analytics**
- **AT-43 Dashboards and scorecard:** totals reconcile with the case register for 10 random filter combinations; the scorecard equals a reference calculation using the configured weights; ageing buckets are correct.
- **AT-44 Reports:** every standard report respects scope and filters, exports CSV/Excel/PDF, and large exports run asynchronously with a download link and audit entry.
- **AT-45 Custom reports:** Metabase embeds show only the viewer's tenant and scope rows; scheduled e-mail reports are delivered.
- **AT-46 AI insights are advisory:** anomaly and forecast outputs never change case state; the work-assessment result is visible to approvers with confidence and model version and cannot auto-approve.

**Business and compliance**
- **AT-47 Metering and limits:** every provider call creates a usage event. Each limit mode behaves correctly (warn notifies; block_channel disables the channel with fallback; allow_overage bills overage).
- **AT-48 Billing:** a monthly invoice run produces correct GST (intra-state CGST+SGST vs inter-state IGST), usage lines and a PDF. An overdue invoice past grace suspends the tenant to read-only; payment reactivates.
- **AT-49 Migration and offboarding:** a legacy CSV of 10,000 cases imports with a status-mapping report; tenant offboarding produces a complete export bundle and schedules deletion after retention.
- **AT-50 DPDP requests:** an access request returns the citizen's data bundle. Erasure anonymises PII across cases, media and audio except legal holds. Retention sweeps delete per policy and are logged.
- **AT-51 Consent and breach:** consent is captured (spoken in voice) and stored with version and timestamp; the breach register workflow notifies configured contacts.

## 6. Release checklist (per release tag)
- All AT for the release green on staging; nightly full E2E green for 3 consecutive nights.
- Load, DR and security reports attached to the release notes.
- Migration rehearsal on a production-sized anonymised snapshot.
- Rollback plan documented; on-call roster set; status page ready.
