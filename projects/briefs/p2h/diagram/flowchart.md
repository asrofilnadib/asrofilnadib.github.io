---
tags:
  - portfolio
  - flowchart
  - p2h
  - A-tier
aliases:
  - P2H Flow
project: P2H
tier: A
slug: p2h
platform: MyPAS
created: 2026-07-27
---

# P2H — Pemeliharaan / Inspeksi MHE + Downtime

> [!info] One-liner
> Operator scan QR MHE → checklist harian → item rusak auto-create **PAS Downtime ticket** → Foreman/Supervisor approve.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/p2h/`

---

## Flowchart

```mermaid
---
config:
  theme: redux
---
flowchart TB
  OP[Operator login P2H] --> QR[Scan QR unit MHE]
  QR --> FORM[Isi checklist per item]
  FORM --> ITEM{Item OK?}
  ITEM -->|Yes| NEXT[Item berikutnya]
  ITEM -->|No| DMG[Detail kerusakan + foto]
  DMG --> TIX{Downtime master ketemu?}
  TIX -->|Ya| DT[Auto-create PAS Downtime ticket]
  TIX -->|Tidak| WARN[Warning — inspeksi tetap tersimpan]
  DT --> SAVE
  WARN --> SAVE
  NEXT --> MORE{Masih ada item?}
  MORE -->|Ya| FORM
  MORE -->|Tidak| SAVE[Submit record on progress]
  SAVE --> REV[Foreman / Supervisor review]
  REV --> AP{Approve?}
  AP -->|Ya| DONE[status=done + signature]
  AP -->|Belum| REV
  DONE --> MON[Monitor status downtime ticket<br/>created → … → closed]
```

## Actors

| Role | Akses |
|------|-------|
| Operator | Scan QR + isi checklist |
| Foreman | Approve, PDF, dashboard |
| Supervisor | Approve + master inspeksi |

## Integrasi

- `CreateDowntimeTicketService` → PAS Downtime
- Telegram timeline saat approve
- PDF export

## Entry points

- `routes/p2h.php`
- `app/Http/Controllers/P2H/`
- `app/Services/P2H/CreateDowntimeTicketService.php`
