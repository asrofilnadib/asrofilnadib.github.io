---
tags:
  - portfolio
  - flowchart
  - smart-lab
  - S-tier
aliases:
  - Smart Lab Flow
project: Smart Lab
tier: S
slug: smart-lab
platform: MyPAS
created: 2026-07-27
---

# Smart Lab — PA + Lab Eksternal

> [!info] One-liner
> Sistem lab: **Permintaan Analisis (PA)**, **Daily Activity (DA)**, dan **Lab Eksternal** (vendor + purchasing).

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/smart-lab/`

## Actors

User dept · Approval/Lab · QA Admin/ETO · GAWI · Purchasing · Master admin

---

## Flow A — Permintaan Analisis (PA)

```mermaid
---
config:
  theme: redux
---
flowchart TB
  U[User dept submit PA kimia/mikro] --> WR[Waiting Receive]
  WR --> R{Receive sample?}
  R -->|Reject| RJ([Rejected])
  R -->|Approve| WC[Lab input hasil → Waiting Check]
  WC --> A{Approve hasil?}
  A -->|Reject| RJ
  A -->|Approve| FIN([Finish])
```

---

## Flow B — Lab Eksternal

```mermaid
---
config:
  theme: redux
---
flowchart TB
  U[User ajukan sample lab eksternal] --> WA[waiting_admin]
  WA --> QA{QA Admin approve + assign vendor?}
  QA -->|Reject| RJ([rejected])
  QA -->|Approve| AG[approve_admin]
  AG --> GW{GAWI input penawaran?}
  GW -->|Reject| RJ
  GW -->|Approve| AP[approve_gawi]
  AP --> PR[Admin create_pr]
  PR --> PO[Purchasing create_po / IM-GR-TTB]
  PO --> CK{GAWI cek PO sesuai?}
  CK -->|Tidak| HOLD([gawi_hold])
  CK -->|Ya| REL[gawi_release]
  REL --> DONE([selesai])
```

---

## Flow C — Daily Activity (ringkas)

```mermaid
---
config:
  theme: redux
---
flowchart LR
  U[User input sample DA] --> Q[Queue approval]
  Q --> AP{Approver approve parameter?}
  AP -->|Ya| OK([Approved])
  AP -->|Belum| Q
```

## Status cheat sheet

| Flow | Status |
|------|--------|
| PA | Waiting Receive → Waiting Check → Waiting Approve → Finish / Rejected |
| Lab eksternal | waiting_admin → … → gawi_release → selesai (branch: rejected, gawi_hold) |

## Entry points

- Routes: `routes/smart_lab/`
- Controllers: `app/Http/Controllers/SmartLab/`
- Status: `app/SmartLab/LabEksternalStatus.php`
