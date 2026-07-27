---
tags:
  - portfolio
  - flowchart
  - logbook
  - A-tier
aliases:
  - Logbook Flow
project: Logbook Magang
tier: A
slug: logbook
platform: MyPAS
created: 2026-07-27
---

# Logbook — Absensi Scale + Approval 2 Level

> [!info] One-liner
> Logbook magang: merge kegiatan harian + tap dari **`t_absensi` (jutaan row)**, lalu approval **SPV → Manager**.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/logbook/`

> [!note] Modul
> Ini **Magang Logbook** (`routes/magang.php`), bukan logbook lain.

## Status

`pending_paraf → ready_spv → spv_signed → manager_signed`

---

## Flowchart

```mermaid
---
config:
  theme: redux
---
flowchart TB
  I[Intern isi logbook harian] --> ABS[(absensi_server.t_absensi<br/>millions of rows)]
  ABS --> MERGE[Merge clock in/out<br/>prioritas: logbook > absensi]
  MERGE --> DAY{Semua hari kerja diparaf?}
  DAY -->|Belum| SPV1[SPV paraf per hari / paraf-all]
  SPV1 --> DAY
  DAY -->|Ya| READY[status ready_spv]
  READY --> SPV2[SPV sign periode]
  SPV2 --> SPVS[spv_signed]
  SPVS --> MGR{Manager sign?}
  MGR -->|SPV belum| BLOCK([Ditolak])
  MGR -->|OK| DONE[manager_signed]
  DONE --> PDF([Print PDF])
```

## Actors

- Magang / Intern
- PIC / SPV (`role_level=spv`)
- Manager (`role_level=manager`)
- Admin Master Magang

## Entry points

- `routes/magang.php`
- `app/Http/Controllers/Magang/LogbookController.php`
- `app/Http/Controllers/Magang/ApprovalController.php`
- `app/Support/MagangLogbookApprovalRules.php`
