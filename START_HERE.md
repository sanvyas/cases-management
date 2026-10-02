# START HERE — Building Samadhan with Claude Code

## What's in this kit
| File | Purpose |
|---|---|
| `CLAUDE.md` | Engineering constitution Claude Code reads every session: rules, repo layout, commands, Definition of Done, quality gates |
| `docs/01_PRODUCT_SPEC.md` | Every module, feature, rule, role, permission and setting |
| `docs/02_ARCHITECTURE.md` | Stack, tenancy, permissions engine, data model, voice, security, deployment, observability |
| `docs/03_BUILD_PLAN.md` | 15 phases in 4 releases, with tasks and acceptance gates |
| `docs/04_TEST_PLAN.md` | Test strategy, AI evaluation thresholds, usability gate, 51 acceptance tests |
| `docs/05_DOMAIN_PACKS.md` | Urban and rural starter catalogues, demo tenants |

## Before you start (fill these, then commit)
Search the docs for `[REGIONAL]` and replace it with your pilot language. Then decide and note in `docs/adr/0000-decisions.md`:
- Pilot region and languages
- Hosting target (AWS ap-south-1 / MeitY-empanelled cloud / state data centre / single VM)
- Providers: STT/TTS, LLM, WhatsApp, SMS, telephony, e-mail
- Git host (GitHub or GitLab) and container registry

## Setup
1. Create an empty repository and copy this kit into its root (`CLAUDE.md` at root, `docs/` folder).
2. Install Claude Code, open the repo, and start a session.
3. Recommended Claude Code habits:
   - Use **plan mode** at the start of each phase; approve the plan before implementation.
   - Run `/clear` between phases. The phase plan and report files carry context forward.
   - Add hooks so lint and typecheck run after edits and `pnpm verify` runs before commits.
   - Review every phase's diff yourself, or have a senior engineer do it, before approving the gate.

---

## Prompt 1 — Kickoff (send once)
```
You are the lead engineer for Samadhan. Read CLAUDE.md fully, then read every file in docs/ in numeric order.

Do not write application code yet. Produce:
1. docs/adr/0001…000N for the decisions listed in Phase 0 of docs/03_BUILD_PLAN.md.
2. docs/plans/phase-00.md: a task-by-task plan for Phase 0 (each task ≤ half a day, with files, commands and tests).
3. A list of every ambiguity, conflict or missing decision you found across the docs, each with your recommended default. Put it in docs/plans/open-questions.md.

Stop and wait for my approval.
```

## Prompt 2 — Run a phase (reuse for every phase; change NN)
```
Implement Phase NN of docs/03_BUILD_PLAN.md, following CLAUDE.md strictly.

1. Re-read CLAUDE.md, the Phase NN section, the related sections of 01_PRODUCT_SPEC.md and 02_ARCHITECTURE.md, and the AT-xx tests listed in the Phase NN gate.
2. Write docs/plans/phase-NN.md:
   - tasks (≤ half a day each) and files
   - migrations, permissions, settings and entitlement keys added
   - tests per task, mapping each AT-xx to the test file that will prove it
   - risks
   Wait for my approval.
3. After approval, implement task by task. For each task: write domain tests first, implement, add integration/RLS/E2E tests, run `pnpm verify`, then make one Conventional Commit.
4. Never skip, weaken or delete a test to make it pass. If a requirement seems wrong, stop and ask.
5. Finish with docs/reports/phase-NN.md:
   - what was built and how to run and demo it
   - AT-xx evidence (test names, output and screenshot paths)
   - coverage numbers, known limitations, TODOs, follow-ups
```

## Prompt 3 — Review pass (after each phase, before approving the gate)
```
Act as three independent reviewers using sub-agents and report findings in docs/reports/phase-NN-review.md:
(a) Security & permissions:
    - tenant isolation and RLS coverage
    - authorize() on every command
    - PII masking and logging
    - input validation, webhook signature checks, secrets
(b) Quality:
    - Definition of Done compliance, test gaps vs the AT list
    - idempotency of jobs, error handling, N+1 queries, missing indexes
(c) UX, i18n and accessibility:
    - hard-coded strings, missing translations
    - citizen/field UX rules from 01_PRODUCT_SPEC §9
    - axe results
Then fix all high and medium findings, re-run `pnpm verify` and the E2E smoke tests, and update the phase report.
```

## Prompt 4 — Fix regressions or bugs (any time)
```
Bug: <describe>. Reproduce it first with a failing test (unit or integration, or E2E if it is UI-only), then fix the root cause, keep all tests green, and add the case to the relevant AT test if it is a business rule. Explain the root cause in the commit body.
```

## Prompt 5 — Release (after Phase 14)
```
Prepare release v1.0.0:
- run the full release checklist in docs/04_TEST_PLAN.md §6
- deploy to staging from scratch using the runbook and record the timing
- run the full E2E, load and DR drill
- produce docs/reports/release-1.0.md with all evidence and remaining risks
Do not deploy to production; list the exact commands for me to run.
```

---

## Realistic expectations (read this)
- **A prompt cannot guarantee a production system on its own.** This kit makes Claude Code build in a disciplined, tested way. You still need a human tech lead reviewing every phase, especially security, tenancy and workflow logic.
- **Effort:** treat this as a multi-month programme. Rough guide, with an engineer supervising Claude Code full-time: R1 about 6–10 weeks, R2 about 6–8 weeks, R3 about 6–8 weeks, R4 about 4–6 weeks. Real speed depends on review capacity and provider approvals.
- **External dependencies you must arrange in parallel** (they block testing with real channels): SMS DLT entity and template registration; WhatsApp Business verification and template approvals; telephony numbers and KYC; STT/TTS/LLM accounts with India data terms; hosting account; domain and TLS; app signing keys and a Play Console account.
- **Things only humans can supply:** real dialect recordings for the AI evaluation set; native-speaker translations; usability sessions with real citizens and field staff; an external VAPT by a CERT-In-empanelled auditor; legal documents (terms, privacy policy, data processing agreements).
- Start selling with **R1 + the voice parts of R2**. That is already a strong product for a first customer, and the later releases can be scheduled against signed contracts.
