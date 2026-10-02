# 05 — Domain Packs and Demo Seed

Packs are versioned JSON files in `packages/db/packs/`. "Apply pack" copies them into tenant tables. Every sub-type in a pack carries:
- an icon key
- names in `en`, `hi` and `[REGIONAL]` (placeholder flagged for human translation)
- 3–6 colloquial voice keywords per language
- SLA (value + unit), assignment mode, ATR levels, EOT/transfer levels, evidence rules and an escalation template

## urban_v1 (Municipal Corporation / Development Authority)
**Levels:** Zone › Ward › Locality (alternate profile: Zone › Division › Ward; Smart City: Zone › Sub-city › Sector › Location point)

| Department | Sub-types (SLA, mode) |
|---|---|
| Water Supply | No water supply (24 h, vendor_auto); Contaminated water (24 h); Pipeline leakage (48 h); Main line burst (12 h, high); Low pressure (72 h); Water tanker request (24 h, service_request); Meter defective (7 d); Wrong bill (7 d, internal_manual) |
| Sewerage & Drains | Sewer overflow/blockage (24 h); Manhole cover missing (24 h, high); Drain choked (48 h); Water-logging (24 h) |
| Sanitation & Garbage | Garbage not collected (24 h, field_auto); Garbage dumped on public land (48 h); Garbage burning (24 h); Dead animal (12 h); Public toilet dirty/no water (24 h); Sweeping not done (24 h); Request for new dustbin (7 d) |
| Streetlights | Streetlight not working (72 h, vendor_auto, penalty on); Light on during day (72 h); Sparking/hanging wire (6 h, emergency); New streetlight request (30 d) |
| Roads | Pothole (7 d); Broken footpath/divider (15 d); Road cave-in (24 h, high) |
| Horticulture | Tree fallen (12 h); Pruning request (15 d); Horticulture waste not lifted (7 d) |
| Encroachment / Enforcement | Encroachment on road/footpath (7 d); Encroachment on public land (15 d); Illegal construction (15 d) |
| Health | Fogging request (72 h); Stray dog menace (72 h); Stray cattle (48 h) |
| Property Tax | Name correction (15 d, service_request); Tax bill not received (7 d) |

**Escalation template:** L1 JE `pct_of_sla 100` → L2 AE `after_sla +1 d` → L3 XEN `after_sla +3 d` → L4 SE `after_sla +5 d` → L5 CE `after_sla +7 d` → L6 MIS notify-only `after_sla +10 d`. Vendor sub-types add L0 agency acceptance `from_registration 20 min` and supervisor `from_registration 30 min`.

## rural_v1 (Zila Parishad / Block / Gram Panchayat)
**Levels:** Block › Gram Panchayat › Village › Habitation (district-level tenants add District above Block)

| Department | Sub-types (SLA, mode) |
|---|---|
| Drinking Water | Handpump not working (48 h, field_auto → pump operator); Tap not supplying water (48 h); Dirty water (24 h); Pipeline leakage (48 h); Water tank not cleaned (7 d); New tap connection (15 d, service_request) |
| Sanitation | Garbage not collected (48 h, field_auto → Safai Karmi); Open drain choked (48 h); Stagnant water/mosquitoes (72 h); Community toilet dirty (48 h); Dead animal (24 h); Compost/soak pit request (15 d) |
| Streetlights | Streetlight not working (72 h); Sparking wire (12 h, emergency); New streetlight request (30 d) |
| Roads & Drains | Damaged village road (15 d); Water-logging (72 h); Culvert/drain repair (15 d) |
| Encroachment | Encroachment on panchayat/common land (15 d); Encroachment on path (15 d) |
| Welfare & Certificates | Pension not received (15 d); Birth/death registration help (7 d); Job card issue (15 d); Wage payment delayed (15 d); Housing scheme installment issue (30 d) |
| Health & Anganwadi | Anganwadi closed/irregular (7 d); Take-home ration not received (7 d); Fogging (72 h); Stray dog menace (72 h) |
| Panchayat Office | Gram Sabha not held (15 d); Staff not available (7 d); Misbehaviour by staff (7 d, routes to Block level); Corruption complaint (15 d, routes to District level) |

**Escalation template:** L1 Panchayat Secretary `after_sla +1 d` → L2 BDO `after_sla +3 d` → L3 CEO Zila Parishad `after_sla +7 d` → L4 MIS notify-only `after_sla +10 d`.

## Message templates (both packs)
Every event in Product Spec §6 gets templates in `en` and `hi`, with SMS kept within one Unicode segment where possible, plus control-room canned replies: Enquiry, Incomplete detail (ask area/ward; ask mobile), Internal response, Negative-feedback response, Positive-feedback thanks, Status update.

## Demo tenants (`pnpm db:seed --demo`)
- **Demo Nagar Nigam** (urban_v1, Standard plan + `voice_app`, `voice_whatsapp`): 2 zones, 6 wards, 18 localities with GeoJSON polygons; 30 people across roles; 2 vendors with coverage; 40 assets with QR; 300 cases across all statuses, channels and ageing buckets; a 60-day history for dashboards.
- **Demo Zila Parishad** (rural_v1, Premium plan): 1 block, 3 Gram Panchayats, 9 villages including **Rampur** (used by voice tests); 25 people; 10 field staff with shifts; 30 handpump/streetlight assets; 200 cases; one Gram Sabha meeting.
- **Platform:** one platform owner, one support user, one finance user; three plans; usage events for 60 days; two invoices.
- **AI eval seed:** 60 sample utterances (text + synthetic audio) per language to make `pnpm test:ai-eval` runnable. Replace with real recordings before production (see test plan §3).
