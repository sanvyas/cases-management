# 01 — Product Specification: Samadhan

## 1. Product summary
Samadhan is a multi-tenant SaaS platform for public-service grievances, service requests and field operations. Citizens report problems through any channel, mainly **by speaking in their own language**. The platform routes each case to the right officer, field worker or vendor; tracks it against SLAs with multi-level escalation; and closes it only with geo-tagged proof and citizen feedback. Customers (tenants) buy modules according to plan. One codebase serves Municipal Corporations, Development Authorities, Smart City SPVs, Zila Parishads, Blocks and Gram Panchayats.

**Lineage:** the requirements derive from the GMDA/MCG Smart CRM Control Panel (8 configuration modules, 234 configured workflows), the GMDA–MCG CHS SRS v1.0/v1.1, the client questionnaire template (escalation matrix L1–L7), and the AUDA CCRS scope (V1/V2/V3 releases, AI/GIS/IVR scope). They were improved with voice-first rural UX, multi-tenancy, module licensing and SaaS operations.

## 2. Personas and system roles
| Role key | Persona | Default scope |
|---|---|---|
| `platform_owner` | Samadhan company super-admin | All tenants |
| `platform_support` | Samadhan support staff | Tenants assigned; audited impersonation |
| `platform_finance` | Billing staff | Billing for all tenants |
| `tenant_admin` | Customer IT / nodal cell | Whole tenant |
| `nodal_officer` | Department or area nodal officer | Their node subtree + department(s); delegated admin one level down |
| `officer` | JE/AE/XEN/SE/CE, SI/SSI/JC, BDO, Panchayat Secretary, Clerk, Patwari | Charges (department × designation × node subtree) |
| `field_staff` | FRT/FT, Safai Karmi, pump operator, lineman, contractual worker | Assigned tasks + mapped areas |
| `vendor_admin` | Vendor nodal person | Their vendor's staff, tasks, contracts, penalties |
| `vendor_staff` | Vendor supervisor or technician | Their vendor's tasks in mapped areas |
| `agent` | Inbound/outbound call-centre agent, GP office or kiosk operator | Registration, enquiries, tasks, chat handover |
| `agent_lead` | Call-centre team lead / supervisor | Agents' queues, monitoring |
| `qc_auditor` | Quality auditor | QC tasks |
| `social_agent` | Social media / e-mail control-room agent | Social and e-mail inboxes |
| `elected_rep` | Sarpanch, councillor, ward member, MLA office | Read-only view of their nodes + raise on behalf |
| `viewer` | Department heads, district collector's office | Read-only dashboards and reports in scope |
| `citizen` | Public | Own cases; phone identity |

Tenants can **clone a system role into a custom role** and adjust permissions within what their plan allows (see §11).

## 3. Module catalogue (entitlement keys)
Every module is a licensable unit. `core` is always on.

| Key | Module | Includes |
|---|---|---|
| `core` | Case engine | Lifecycle, routing, SLA, escalation, ATR, approvals, timeline, staff web, basic reports |
| `citizen_web` | Citizen PWA | Picture flow, track, feedback |
| `voice_app` | Voice in app/web | Speak-to-register in app and PWA |
| `voice_whatsapp` | WhatsApp voice notes | Voice intake on WhatsApp |
| `voice_phone` | AI phone line | Streaming voice agent on a phone number, human fallback |
| `whatsapp_bot` | WhatsApp bot | Menus, intake, notifications, feedback, live-agent handover |
| `sms` | SMS | Outbound notifications and status |
| `sms_inbound` | SMS short codes | Inbound short-code complaints and `STS` status |
| `email_channel` | E-mail inbox | Mailbox ingestion, e-mail control room |
| `voice_inbound` | Voice inbound | Process existing complaint call recordings into cases |
| `kiosk` | Kiosk mode | Touch kiosk / CSC assisted mode, token slips |
| `agent_console` | Call centre | Agent desktop, enquiries, tasks, CTI, live chat |
| `qc` | Quality check | QC tasks, scoring, AI auto-scoring of calls |
| `officer_app` | Staff mobile app | Officer/field/vendor mobile app with offline mode |
| `field_whatsapp` | Field staff on WhatsApp | Task accept/EOT/ATR via WhatsApp |
| `workforce` | Workforce management | Shifts, attendance, availability, FRT self-registration, mobilise/demobilise, live location |
| `vendor_mgmt` | Vendor management | Vendor portal, contracts, coverage, performance, communication |
| `penalties` | Vendor penalties | Penalty rules, ledger, approvals, billing deduction export |
| `qr_assets` | Asset register & QR | Asset master, QR stickers, scan-to-report |
| `broadcast` | Area broadcasts | Outage/maintenance notices, duplicate suppression |
| `photo_checks` | Evidence integrity | EXIF, distance, reuse detection |
| `ai_work_assessment` | AI before/after assessment | Advisory image comparison |
| `knowledge_bot` | Knowledge answers | FAQ / scheme info answers in bot and voice |
| `senior_citizen` | Senior citizen services | Priority flag, dedicated line, nearby help points, emergency button, campaigns |
| `gram_sabha` | Gram Sabha | Meetings, bulk complaints, status report |
| `elected_rep_view` | Representative view | Sarpanch/councillor app view |
| `public_dashboard` | Transparency portal | Public aggregate dashboard and rankings |
| `dashboards_advanced` | Advanced analytics | Heat maps, spatial analytics, composite scorecard, ageing, comparative |
| `analytics_ai` | Predictive analytics | Hotspots, anomaly detection, forecasting, recurring issues |
| `custom_reports` | Report builder | Embedded BI, saved reports, scheduled e-mail reports |
| `integrations` | Integration hub | Connectors (state portals, CM window, CPGRAMS, billing, tax, GIS, vehicle GPS, SWM, ICCC), outbound webhooks, public API keys |
| `data_export` | Bulk export | Full data export, API extraction |
| `sso` | Single sign-on | OIDC/SAML for staff |
| `dedicated_hosting` | Dedicated deployment | Own database/cluster (ops flag) |

Plans (Basic / Standard / Premium / Enterprise) are data: a module set plus limits. Per-tenant overrides and time-bound trials are supported.

## 4. Channels
| Channel | Module | Behaviour |
|---|---|---|
| Citizen PWA + Android app | `citizen_web` | Voice button, picture category flow, photo/video, GPS, track, feedback, QR scan |
| Voice in app | `voice_app` | Conversational intake; see §7 |
| WhatsApp | `whatsapp_bot`, `voice_whatsapp` | Text/voice/image/video/location/buttons/lists; 24-h session vs template rules; live-agent handover |
| AI phone line | `voice_phone` | Streaming STT → LLM → TTS conversation; barge-in; press 0 for human; reads complaint number |
| Classic IVRS menu | `voice_phone` (fallback mode) | DTMF department menu → agent queue; outbound feedback calls (press 1 / 0) |
| Call centre (human) | `agent_console` | Caller pop-up, fast registration, enquiry logging, follow-up tasks |
| Missed call | `missed_call` | Missed call → callback within configured minutes by voice AI or agent task |
| Office walk-in / GP office | `agent_console` | Complaint officer login per office with mapped area |
| Kiosk | `kiosk` | Touch UI: register, check status, view bill (if billing integration), token slip print |
| SMS outbound | `sms` | DLT templates; all citizen events |
| SMS inbound | `sms_inbound` | `<CODE> <ID>` complaints; `STS <no>` status; codes and aliases are configurable data |
| E-mail | `email_channel` | Mailbox ingestion (IMAP/Graph/Gmail API); control room actions; replies from platform |
| Twitter/X, Facebook, Instagram | `social_inbox` | Mentions, comments, DMs, posts captured; control room; reply from platform |
| State/central portals | `integrations` | Two-way: cases pushed in, status pushed back |
| QR sticker | `qr_assets` | Scan → asset and location prefilled |

**Control-room actions (social and e-mail):** Status update, Positive-feedback response, Negative-feedback response, No response, Internal response (forward to officer), Incomplete details (ask for more), Enquiry, Convert to complaint. Each action uses a predefined template (editable) or a custom message, in the selected language.

## 5. Case lifecycle and workflow engine
### 5.1 Case kinds
`complaint` (grievance), `service_request` (e.g. tanker, certificate help), `enquiry` (logged, closed on save), `incident` (cluster parent).

### 5.2 Assignment modes (per sub-type)
| Mode | Behaviour | Source mapping |
|---|---|---|
| `internal_auto` | Auto-assign to officer by charge + node + area, least-loaded, available | SRS Process D |
| `internal_manual` | Into dispatch queue of the initiator designation; officer assigns | — |
| `pool_manual` | Officer assigns from a common pool of internal staff | SRS Process C |
| `field_auto` / `field_manual` | Contractual/FRT staff by area, shift and availability | Control Panel "Contractual" |
| `vendor_auto` | Vendor by coverage (sub-type × nodes × areas), then vendor staff | SRS Process A |
| `vendor_manual` | Officer assigns vendor | SRS Process B |

**Routing fallback:** if no assignee is found, assign to the node's default officer, flag `ROUTING_FAILED`, and alert the nodal officer. A case is never unowned.
**Availability:** people on leave, off shift or demobilised are skipped. Temporary charge (valid from/to) applies automatically.

### 5.3 Statuses
`REGISTERED → ASSIGNED → ACCEPTED → IN_PROGRESS → ATR_SUBMITTED → ATR_REVIEW(n) → RESOLVED → CLOSED`

Side states: `ON_HOLD` (with reason and approval; SLA paused only if the sub-type allows), `EOT_PENDING`, `TRANSFER_PENDING`, `REOPENED`, `REJECTED` (invalid, duplicate, out of jurisdiction, fake/abusive), `NEEDS_CLASSIFICATION` (AI low confidence), `MERGED` (child of an incident).

### 5.4 Rules
1. **Registration** captures:
   - node/area (from GPS polygon, QR, spoken name match, or picker), address, lat/lng
   - photos/videos (mandatory per sub-type), description (text or voice transcript)
   - citizen phone and name, account/household ID if relevant, consumer type, custom fields, channel and source reference

   The case number is phone-friendly with a tenant prefix (e.g. `GMD-26-004512`) and is shown, spoken and sent. If location is mandatory and missing (e.g. a phone call), automatically send a WhatsApp location request.
2. **Acceptance:** the assignee must accept within the sub-type's acceptance time (default 10 min for vendors). On timeout, notify the supervisor and create an outbound follow-up task.
3. **Work estimate:** if the assignee expects to exceed the SLA, they request an **EOT** (proposed date + reason). It passes through approval levels. On approval the due date shifts and escalation timers recompute; on rejection the original date stands. Max extensions apply.
4. **ATR:** remarks (text or voice), device-camera photos (min N), device GPS and timestamp, optional materials and cost fields. Then ATR review levels in order (e.g. JE → AE → XEN). Any level can approve or return with remarks; a return reopens the task to the assignee.
5. **Closure:** after final ATR approval, or by an authorised agent with proof (sub-type flag).
6. **Edit:** change sub-type or node/area. This re-routes and recomputes SLA, approvers and escalation, and is logged.
7. **Transfer:** to another department, sub-type or node, with approval levels. SLA policy is `preserve`, `recalculate` or `restart`.
8. **On hold:** request with a reason category (funds, material, court, other department) and expected date; needs approval; shown separately in reports.
9. **Feedback:** on resolution, collected through the citizen's channel: an IVR call within allowed hours (default 08:00–20:00), WhatsApp buttons or voice, an SMS link, the app, the web or the bot survey.
   - Positive → satisfied.
   - Negative **within the reopen window (default 30 min)** → **auto-reopen** with the same owner.
   - Negative **after the window** → ATR task for the officer **one level up**; their positive outcome closes the case, a negative outcome reopens it.
   - No response → agent callback task.
   - Survey (configurable): overall rating, agent skills, staff behaviour, comment.
10. **Reopen:** by the citizen within the reopen window (days) or by an agent; approval levels if configured; max reopens.
11. **Clustering:** same sub-type within radius R and window W → offered "me too", linked as a supporter to the parent incident. Supporters are notified on resolution.
12. **Photo checks:** EXIF time older than X hours; ATR GPS distance greater than D metres from the case; perceptual-hash reuse within the tenant; missing EXIF. Flags appear to approvers; blocking is configurable.
13. **Penalties** (`penalties`): on vendor SLA breach, apply the rule (fixed or per-day with cap, per sub-type) → penalty entry → approval or waiver → ledger → export for bill deduction.
14. **Spam control:** per-phone and per-IP rate limits, a blocklist, a "mark fake/abusive" action (with approval), auto-flagging of abusive language, and repeated-fake thresholds that require agent verification before routing.
15. **Senior citizen priority** (`senior_citizen`): a citizen flag (self-declared or by agent) gives priority routing, a shorter SLA multiplier and a dedicated queue.
16. **Timeline:** append-only. The citizen sees a safe subset.

### 5.5 Escalation model
`escalation_rules` per sub-type, levels 1–7. Each level has `escalate_to` (designation or role), a `trigger_basis` and a `notify_only` flag. Trigger bases:
- `pct_of_sla` — e.g. 50%, 100%, 150%, 200% of SLA elapsed (questionnaire style)
- `after_sla` — at 100% of SLA plus an offset in minutes, hours or days ("SLA + 1 day", SRS / Control Panel style)
- `from_registration` — a fixed offset after registration (e.g. agency 20 min, supervisor 30 min)

Levels fire in strictly increasing time order, once each, and are working-hours aware when the sub-type uses working hours. Escalation notifies the escalated officer and adds the case to their **"Escalated to me"** queue, where they can direct, reassign, comment or take over (permission-dependent). An "MIS" level can be notify-only (e.g. a daily digest).

### 5.6 Rights matrix (per sub-type × designation)
accept · change_vendor · reassign · submit_atr · verify_atr · request_eot · approve_eot · request_transfer · approve_transfer · request_hold · approve_hold · reject · approve_reject · close_by_agent · reopen · approve_reopen · penalty_approve · edit_case.

## 6. Notifications and messaging
- **Rules matrix:** events × recipient kinds × channels in priority order, per sub-type (with tenant defaults).
- **Events:** registered, assigned, accepted, acceptance_overdue, sla_warning, escalated, atr_submitted, atr_returned, resolved, closed, reopened, eot_requested, eot_decided, transfer_requested, transfer_decided, hold_requested, hold_decided, feedback_request, penalty_raised, broadcast, daily_digest.
- **Recipients:** citizen, supporters, assignee, approver at level, escalated_to, supervisor, nodal officer, elected rep, vendor admin.
- **Templates** per event × channel × language, with variables; DLT template ID for SMS; WhatsApp template name and approval status; optional TTS audio.
- **Delivery:** transactional outbox → per-channel queues → provider adapters. Retries use exponential back-off. Fallback order is per tenant setting. Delivery receipts are stored. Quiet hours for citizen notifications (configurable; emergencies exempt).
- **Broadcasts** (`broadcast`): area notices with a time window and per-language text and audio. They suppress duplicates and are optionally pushed to citizens with recent cases in those nodes.

## 7. Voice AI intake (core differentiator)
**Channels:** app/PWA (`voice_app`), WhatsApp voice notes (`voice_whatsapp`), phone streaming (`voice_phone`).

**Engine** (shared across channels): `intake_sessions` hold language, slots, turns, transcript, audio references, model versions and costs.
- **Slots:** intent (register, track, feedback, enquiry, reopen, other), sub-type, location (asset/node/area text/lat-lng), description, name (optional), senior-citizen self-declaration (optional).
- **Each turn:** STT (auto language detection among the tenant's languages; code-mixed speech) → LLM with **tenant catalogue (sub-type names, local names, voice keywords) and candidate nodes** → strict JSON (schema-validated) → next question → TTS. Phone barge-in is supported.
- **Confirmation read-back** before creation, then the case number is spoken, then a photo/location request (WhatsApp link or in-app camera).
- **Location strategy (in order):** QR asset → device or shared GPS mapped to node by polygon or nearest → fuzzy match of spoken place names (all languages, phonetic matching) → caller's last location → ask the user to share location.
- **Guardrails:**
  - choose only from provided lists
  - confidence threshold (setting, default 0.7) — below it, or after more than 6 turns, create the case as `NEEDS_CLASSIFICATION` for agent review with AI top-3 suggestions
  - never collect Aadhaar or bank data
  - profanity handling
  - press or say "0" for a human at any time
- **Other intents:** track (read the latest cases' status), feedback, reopen, enquiry (answered by `knowledge_bot` if entitled, else logged and routed).
- **Evaluation:** a golden dataset per tenant and dialect; accuracy gates before enabling auto-routing (see test plan).

## 8. Staff experiences
- **Staff web — officer:**
  - Inbox tabs: Assigned, To approve, Escalated to me, Due today, Overdue, On hold, Needs classification
  - Realtime updates; colour-coded SLA (green / amber > 75% elapsed / red overdue)
  - Bulk actions where safe
  - Case detail with map, media + flags, timeline, supporters, related cases, allowed actions only
- **Staff mobile app — officer/field/vendor** (`officer_app`):
  - My counts; one-decision approval cards; voice remarks
  - Camera-only ATR with GPS and time watermark; navigate button
  - Offline-first (local DB + sync queue preserving capture time); push notifications
  - Live location sharing while on duty (`workforce`)
- **Field staff on WhatsApp** (`field_whatsapp`): task message with map link, buttons Accept / Need more time / Done; Done → photo + location → ATR; voice-note remarks transcribed.
- **Agent console** (`agent_console`):
  - Caller pop-up by phone with history and open cases
  - Fast registration with dictation; enquiry logging with categories
  - Task queues: acceptance follow-ups, feedback callbacks, missed-call callbacks, classification review
  - **Live chat handover** inbox for WhatsApp/web chat
  - Disposition codes; agent status (available/break/offline); CTI click-to-call; masked calling
- **QC** (`qc`): scheduler or manager creates QC tasks (all agents, one agent, specific cases) → auditor listens and scores parameters (AHT, response, CSAT, script adherence) and uploads audio → supervisor remarks → final score to manager and agent. AI auto-scores 100% of calls; humans sample.
- **Elected rep view** (`elected_rep_view`): area counts, oldest pending, ranking, raise on behalf.
- **Gram Sabha** (`gram_sabha`): meeting record, bulk entry, printable status report for the next meeting.

## 9. Citizen experience and UX rules (apply everywhere citizens or field staff interact)
- Language picker first (language names in their own scripts).
- Home: giant mic button, 6–9 big category pictures, "My complaints".
- One question per screen; 56 px minimum touch targets; 18 px base font; high contrast.
- Every status has colour + icon + short label + 🔊 listen (TTS).
- Phone identity with OTP auto-read; no passwords for citizens or field staff.
- Every text field has a mic button; every error is visual and spoken.
- 4-step progress strip: Received → Assigned → Work done → Closed.
- Feedback: two huge buttons 👍 / 👎 plus an optional voice comment.
- Works at 360 px, on 3G, offline shell; images compressed to ≤ 300 KB; video ≤ 30 s.
- Usability gate: 15–20 real users per pilot region complete core tasks unaided (see test plan).

## 10. Workforce, vendor, asset management
- **Workforce** (`workforce`): profiles; shifts and rosters; attendance (app check-in with GPS); leave and availability; skill tags; FRT self-registration with officer approval; mobilise/demobilise; change mobile; area and shift updates; transfer requests; workload and performance KPIs; live map of on-duty staff.
- **Vendor** (`vendor_mgmt`): onboarding (registration, GSTIN, PAN, documents, certifications); contracts (start/end, value, SLA terms, renewal alerts 30 days before expiry); coverage (sub-type × nodes × areas); vendor designations and staff; vendor portal; two-way messaging with officers; performance scorecards; reports; penalties (`penalties`).
- **Assets** (`qr_assets`): asset types (handpump, streetlight pole, dustbin, toilet, manhole, transformer and so on) with custom attributes; asset register with node and lat/lng; bulk import; QR generation and printable sticker sheets; scan-to-report; asset history; moving assets between nodes.

## 11. Permissions model
- **Permission catalogue:** codes such as `case.read`, `case.create`, `case.assign`, `case.atr.submit`, `case.atr.verify`, `case.eot.request`, `case.eot.approve`, `case.transfer.*`, `case.hold.*`, `case.reject.*`, `case.edit`, `case.export`, `citizen.pii.view`, `config.geography.write`, `config.people.write`, `config.catalogue.write`, `config.workflow.write`, `config.notifications.write`, `config.settings.write`, `user.manage`, `role.manage`, `report.view`, `report.export`, `report.custom`, `qc.*`, `vendor.*`, `workforce.*`, `asset.*`, `broadcast.*`, `social.*`, `integration.*`, `audit.view`, `billing.view`, `platform.*`. Each code is linked to the module that licenses it.
- **Roles** are bundles of permissions. There are system roles (§2) and tenant custom roles (cloned and edited; cannot exceed plan modules).
- **Grants:** a user's role assignment carries **scope**: `tenant`, `node_subtree(node_ids)`, `department(ids)`, `vendor(id)`, `assigned_only` or `own`. Scopes combine with AND within a grant and OR across grants.
- **Workflow rights** (§5.6) are evaluated per sub-type and designation, on top of role permissions.
- **Evaluation order:** tenant active → module entitled → permission in role → scope covers resource → workflow right (if a case action) → state machine allows → setting-based constraints (e.g. working hours). Deny by default.
- **Data masking:** citizen phone and name masked unless `citizen.pii.view`; media of people blurred on public views.
- **Delegated administration:** `nodal_officer` can manage users and nodes **one level below** within their scope; changes are audited and can require tenant-admin approval (setting).
- **Platform support impersonation:** time-boxed, reason required, banner shown, every action audited, tenant admins notified (setting).

## 12. Settings registry (typed; auto-generated settings UI; audited)
Settings have key, type (Zod schema), default, allowed scopes (`platform` → `tenant` → `node` where relevant) and the module they belong to. Categories:
- **General:** name, short name, case-number prefix, timezone, date format, default and enabled languages, branding (logo, colours, favicon), helpline numbers, support e-mail, public URL slug, custom domain.
- **Vocabulary:** label overrides per language (hierarchy levels, roles, key nouns).
- **Case rules:** default SLA unit, working-hours calendar, holiday calendar, acceptance timeout default, reopen window minutes/days, max reopens, auto-close days without feedback, feedback call window, cluster radius/window defaults, photo-check thresholds and blocking mode, transfer SLA policy, on-hold SLA pause policy, closure-by-agent allowed.
- **Voice/AI:** enabled voice channels, STT/TTS/LLM provider per tenant, voice persona (gender/speed), confidence threshold, max turns, human-fallback number, recording retention days, AI auto-routing on/off per sub-type.
- **Messaging:** channel fallback order, quiet hours, SMS sender ID, WhatsApp number, DLT entity ID, e-mail sender, daily digest time.
- **Security:** staff 2FA required, session timeouts, OTP limits, IP allowlist for admin, SSO config, impersonation notice, password policy (if passwords enabled).
- **Privacy/DPDP:** consent text per language, retention per data class (audio, photos, PII, cases), anonymisation after N years, DSAR contact, breach contacts.
- **Workforce:** shift definitions, attendance GPS radius, live-location interval.
- **Vendor:** penalty defaults, contract alert days.
- **Analytics:** scorecard weights (must total 100%), ageing buckets, report e-mail schedules.
- **Billing (platform):** plan, billing cycle, GST details, usage overage policy (`warn | block_channel | allow_overage`).

## 13. Configuration console (tenant admin)
Tiles:
1. **Geography:** hierarchy levels; node tree (add, move, merge, deactivate); areas; LGD import; boundary GeoJSON upload.
2. **People & roles:** people master (all types); designations tree; charges incl. temporary; roles and custom roles; user invites; bulk import; transfers and promotions wizard (handles open cases).
3. **Catalogue:** departments; types; sub-types (all rule fields, icons, multilingual names, voice keywords); custom fields.
4. **Workflow:** rights matrix; approval rules (ATR/EOT/Transfer/Hold/Reject/Reopen); escalation builder with plain-language preview.
5. **Vendors & workforce:** vendors, coverage, contracts, penalty rules, shifts, FRT approvals.
6. **Messages:** notification matrix, templates, broadcasts.
7. **Assets:** asset types, register, QR sheets.
8. **Channels:** WhatsApp, SMS, e-mail, social accounts, telephony numbers, kiosk devices, missed-call number.
9. **Integrations:** connectors, webhooks, API keys.
10. **Settings:** registry UI (§12).
11. **Onboarding & tools:** onboarding wizard; Excel templates (Basic Details, Admin Hierarchy, Officer Hierarchy, Officer Master, Complaint Types & SLA, Escalation Matrix, Assets, Vendors); **Routing Simulator**; **Health Check**; config change history and rollback of config versions.

**Config versioning:** cases pin the workflow configuration version in force at registration.

## 14. Data management operations
- **Hierarchy changes:** create a zone/ward/GP; move an area or node to another parent; merge nodes; deactivate. The preview shows affected open cases, people and vendors. Open-case policy options: keep with current owner, re-route by new mapping, or re-route only unassigned.
- **People changes:** promotion (role and designation change), transfer (charge change with handover of open cases to successor or by re-routing), exit (deactivate with forced reassignment), profile changes, password reset and unblock.
- **Field staff:** create, approve self-registration, edit, transfer, block/unblock, mobilise/demobilise, change mobile, shift and area.
- **Assets:** register, bulk import, move between nodes.
- **Legacy migration tool:** CSV/Excel mapping wizard to import historical cases with status mapping and validation report.

## 15. Reports and dashboards
- **Dashboards** (scoped by user; drill-down through every hierarchy level to the case):
  - KPIs: total, open within, open beyond, closed, % within SLA, avg resolution, avg first response, reopen %, satisfaction %, escalated, on hold
  - trend; department and sub-type; channel mix (voice vs picture vs WhatsApp vs agent vs social)
  - ageing buckets (configurable; default 24 h, 15 d, 30 d, 90 d, 180 d, 1 y)
  - beyond-time pendency by category; reopen analysis; feedback dashboard
- **Spatial** (`dashboards_advanced`):
  - colour-coded node map with filters (real-time / comparative / historical; type/sub-type; period; all / beyond time / negative feedback %)
  - heat map; repeated locations; asset hotspots
- **Composite scorecard:** top-5 and bottom-5 per level by weighted score. Defaults: within-SLA closure 30%, satisfied feedback 30%, timely action on unsatisfied closures (within 5 days) 15%, volume relative to population/consumers 10%, field-staff activity/registration 15%.
- **Standard reports:**
  - hierarchy- and sub-type-wise summary
  - vendor SLA report
  - date-wise counts; month-wise; FY-wise
  - reopen summary
  - feedback summary; unsatisfied citizens detail
  - zone-wise top-5 defaulters; real-time ranking
  - beyond-time pending by type; will-breach-in-X-hours
  - enquiry summary; date-wise complaints and enquiries
  - real-time downloadable report (filters: type, date and time range, status closed / pending-within / pending-beyond)
  - pending detail
  - SMS/WhatsApp delivery and cost
  - officer, field and vendor performance; penalties
  - photo flags; voice intake quality; QC scores; agent performance
  - Gram Sabha
- **Custom reports** (`custom_reports`): embedded BI (Metabase) on a read-only reporting schema with RLS-equivalent row filtering; saved reports; scheduled e-mail delivery.
- **Predictive** (`analytics_ai`): hotspot detection, anomaly detection (spikes, unusually fast closures, ageing outliers, repeated reopening), seasonal forecasting, cross-system correlation. All outputs are **advisory**; they never change workflow automatically.
- **AI work assessment** (`ai_work_assessment`): before/after image comparison producing condition change, a confidence score and concerns. Advisory to approvers; model version stored.
- **Public dashboard** (`public_dashboard`): aggregate numbers and rankings, no personal data.

## 16. Integrations hub (`integrations`)
- Connector framework with per-tenant configuration, credential vault, field mapping UI, inbound/outbound message log, retries, reconciliation report and health status.
- **Built-in connector types:**
  - generic REST/webhook (inbound case creation, outbound status)
  - state e-services portal (Saral-type), two-way
  - CM Window / CPGRAMS-type grievance portals
  - utility billing (consumer lookup, bills, service requests)
  - property tax (lookup, service requests)
  - GIS (asset/area lookup by lat-lng; WMS/WFS layers)
  - vehicle GPS (AVL feed on map)
  - solid-waste management system
  - ICCC/SCADA/street-light CMS (incident feeds)
  - citizen-app push-in/status-out
- **Public API:** API keys per tenant with scopes and rate limits; outbound signed webhooks for case events.

## 17. SaaS business operations (platform console)
- Tenant lifecycle: create, configure, trial, activate, suspend (read-only mode), offboard (full data export, then deletion after retention).
- Plans, modules, limits; per-tenant overrides; trials with end dates.
- **Usage metering** of WhatsApp, SMS, voice minutes, STT seconds, TTS characters, LLM tokens, storage, active staff users, cases. Estimated cost and margin per tenant.
- **Billing:** subscriptions, invoices with GST (CGST+SGST or IGST by place of supply), usage line items, credit notes, payment recording (manual, plus optional Razorpay), dunning reminders, overdue → configurable suspension.
- **Support desk:** tenant admins raise tickets to the platform; SLA and status; linked impersonation sessions.
- **Release notes and announcements** to tenant admins.
- **Platform metrics:** active tenants, cases/day, voice share, SLA %, cost per case by channel, provider health.

## 18. Compliance features
- **DPDP:** consent capture (spoken in voice flows) with stored consent records; privacy notice per language; retention jobs per data class; data-principal requests (access, correction, erasure) workflow with SLA; breach incident register and notification workflow.
- **CERT-In:** security logs retained ≥ 180 days; NTP-synchronised timestamps; incident reporting runbook.
- **Accessibility:** GIGW/WCAG 2.1 AA.
- **Data residency:** India-hosted; no citizen data used to train external models (provider contracts and settings).
