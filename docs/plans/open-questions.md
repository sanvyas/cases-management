# Open Questions and Ambiguities

Questions found across the spec documents, each with a recommended default. These need your input before we start building.

---

## 1. Pilot Region and Languages
**Question:** Which region is the first customer, and which languages should we support at launch?

**Where it matters:** The `[REGIONAL]` placeholder appears throughout the docs — in i18n locale files, voice AI evaluation datasets, domain pack translations, and message templates. We need a real language to replace it.

**Recommended default:** Start with **Hindi** and **English** only. Add the regional language (e.g., Gujarati for GMDA/AUDA, Marathi for a Maharashtra customer, Punjabi for a Haryana customer) once the pilot customer is confirmed. This lets us build and test without waiting for translations.

---

## 2. Hosting Target
**Question:** Where will the system run? Options from the docs:
- AWS ap-south-1 (most common for Indian SaaS)
- MeitY-empanelled cloud (government requirement for some customers)
- State data centre (on-prem deployment)
- Single VM (smallest customers)

**Where it matters:** Determines which Terraform modules we write, which managed services we rely on vs. self-host, and the deployment runbook.

**Recommended default:** Build for **single-VM Docker Compose first** (simplest, works anywhere), with the Helm chart for Kubernetes as the second target. This covers both small government deployments and cloud scaling. AWS-specific Terraform can come later when there is a paying customer on AWS.

---

## 3. Provider Choices
**Question:** Which providers for STT, TTS, LLM, WhatsApp, SMS, telephony, and email?

**Where it matters:** We build mock adapters for all providers, but we need at least one real provider per category to test end-to-end.

**Recommended defaults:**
| Service | Primary | Notes |
|---|---|---|
| STT | Sarvam AI | Best for Indian languages per the spec |
| TTS | Sarvam AI | Same |
| LLM | Claude (Anthropic) | Structured output support, good multilingual |
| WhatsApp | Meta Cloud API | Direct, no BSP dependency for dev |
| SMS | MSG91 or Gupshup | Popular in India, DLT support |
| Telephony | Exotel | Indian market leader, WebSocket support |
| Email | SMTP (Mailpit in dev) | Simple; SES or Resend for production |

**Action needed:** Confirm providers and sign up for sandbox/test accounts. This doesn't block Phase 0-3 (we use mocks), but blocks real testing in Phase 4+.

---

## 4. Git Host and Container Registry
**Question:** GitHub or GitLab? Which container registry?

**Recommended default:** **GitHub** (already in use) with **GitHub Container Registry (ghcr.io)**. The CI pipeline is written for GitHub Actions.

---

## 5. Case Number Format
**Spec says:** phone-friendly with a tenant prefix, e.g. `GMD-26-004512`.

**Ambiguity:** What does the middle segment represent? Year? Sequential partition?

**Recommended default:** `{PREFIX}-{YY}-{SEQUENCE}` where `{PREFIX}` is a tenant setting (3-5 chars), `{YY}` is the two-digit financial year (April-March, per Indian government convention), and `{SEQUENCE}` is a zero-padded integer that resets each financial year. Example: `GMD-26-004512` means GMDA, FY 2025-26, complaint #4512.

---

## 6. Working Hours Definition
**Spec mentions:** working hours for SLA calculation and escalation.

**Ambiguity:** What is the default working-hours calendar?

**Recommended default:** Monday-Saturday, 09:00-18:00, tenant timezone (IST). Sundays and gazetted holidays are non-working. Configurable per tenant in settings. Emergency sub-types can be flagged as 24x7 (calendar hours).

---

## 7. SMS DLT Template Registration
**Spec mentions:** DLT entity and template registration required for SMS in India.

**Question:** This is a real-world dependency. Who registers the DLT entity?

**Impact:** Blocks real SMS testing. Does not block development — we use mock adapters.

**Recommended action:** The customer (tenant) registers their own DLT entity. Platform-level SMS (OTP, support) uses the Samadhan company's DLT entity. Both entity IDs are settings. Flag this for the first customer onboarding checklist.

---

## 8. Consent for Voice Recording
**Spec says:** consent captured (spoken in voice flows) with stored consent records.

**Ambiguity:** Exact consent flow — when, what is said, what counts as acceptance?

**Recommended default:** At the start of every voice call and first voice note interaction, play/show: "This call is being recorded to help resolve your complaint. Say 'yes' or press 1 to continue." Store the audio segment as the consent record. For WhatsApp voice notes, the first bot message includes the disclosure. The consent text is a setting per language.

---

## 9. Kiosk Token Slip Printing
**Spec mentions:** token slip print (browser print or ESC/POS bridge).

**Ambiguity:** Which printing method?

**Recommended default:** **Browser print** (CSS `@media print` with a receipt-sized layout). ESC/POS direct printing requires a local bridge service that adds deployment complexity. If a customer specifically needs thermal receipt printers, we add an ESC/POS bridge adapter later (ADR at that point).

---

## 10. Phone Identity — Password vs Passwordless
**Spec says:** phone OTP for citizens; optional password for staff; no passwords for citizens or field staff.

**Ambiguity:** Minor contradiction — staff "optional password" but field staff "no passwords."

**Recommended default:** 
- **Citizens:** phone OTP only, no password.
- **Field staff and vendors:** phone OTP only, no password (they are mobile-first, low-literacy users).
- **Officers and above:** phone OTP primary; optional password as a secondary method (for desktop access in offices with poor mobile signal). Setting per tenant.
- **Platform users:** password + TOTP 2FA required.

---

## 11. Financial Year Convention
**Where it matters:** Case numbering, annual reports, FY-wise aggregations.

**Ambiguity:** The spec mentions FY-wise reports but doesn't define the FY boundary.

**Recommended default:** Indian financial year: April 1 to March 31. Configurable per tenant (some may use calendar year). The setting is `financial_year_start_month` (default: 4).

---

## 12. Media Compression Limits
**Spec says:** images ≤ 300 KB, video ≤ 30 seconds.

**Ambiguity:** Are these upload limits or post-processing limits? What resolution?

**Recommended default:**
- **Upload limits:** images up to 10 MB, videos up to 50 MB (to accept any phone camera output).
- **Processing:** server re-encodes images to ≤ 300 KB (WebP/JPEG, max 1920px on longest side), videos to ≤ 30s duration and ≤ 10 MB (H.264). Originals stored for evidence; compressed versions served to clients.
- These limits are settings per tenant.

---

## 13. Metabase Licensing
**Spec uses:** Metabase for embedded BI / custom reports.

**Question:** Open Source Metabase or Metabase Pro/Enterprise (for signed embedding)?

**Recommended default:** Start with **Metabase Open Source** (free). Signed embedding (used for tenant-scoped embedding) is available in the paid tier. For initial development, we use iframe embedding with JWT auth and server-side row filtering. Upgrade to Pro when a customer needs the premium embedding features. Record this in an ADR when the decision is needed (Phase 11).

---

## 14. Case Table Partitioning
**Already covered:** in ADR-0007. Decision deferred to Phase 3 load test.

---

## 15. Offline Sync Conflict Resolution
**Spec says:** server state wins; local actions re-validated on sync with a clear user message.

**Ambiguity:** What happens if the server rejects an offline action (e.g., the case was already reassigned)?

**Recommended default:** On sync, each queued action is replayed against the current server state. If the action is no longer valid (case reassigned, already approved, etc.), the action is marked as "rejected" locally with a clear message to the user explaining what happened and the current state. No data is silently lost. The sync log is visible to the user.

---

## Next Steps
Please review these questions and tell me:
1. Which defaults are fine as-is.
2. Which ones you want to change.
3. Any decisions I should know about (pilot customer, providers already chosen, etc.).

Once confirmed, I'll update the docs accordingly and proceed with Phase 0 implementation.
