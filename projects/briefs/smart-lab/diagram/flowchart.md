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
updated: 2026-07-28
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

Status sample (derived dari flag `is_approve` / `is_simpan` / `is_approve_hasil`):

| Status | Artinya |
|--------|---------|
| Waiting Receive | Sample baru, menunggu lab terima |
| Waiting Check | Sample diterima, lab input hasil |
| Waiting Approve | Hasil tersimpan, menunggu approve hasil |
| Finish | Hasil disetujui |
| Rejected | Ditolak saat receive **atau** saat approve hasil |

User boleh **edit** sample selama status `Waiting Receive` atau `Waiting Approve`.

```mermaid
---
config:
  theme: dark
---
flowchart TB
  U["User submit PA<br/>kimia / mikro"] -->|Waiting Receive| WR["Lab: Waiting Receive"]
  WR -->|Reject sample| RJ(["Rejected"])
  WR -->|Approve sample| WC["Lab input hasil<br/>Waiting Check"]
  WC --> WA["Hasil tersimpan<br/>Waiting Approve"]
  WA -->|Reject hasil| RJ
  WA -->|Approve hasil| FIN(["Finish"])
  U -. edit selama<br/>Waiting Receive / Waiting Approve .-> U
```

**SVG:** `flowchart.svg` (gallery: Permintaan Analisis)

---

## Flow B — Lab Eksternal

Status dari `App\SmartLab\LabEksternalStatus`:

| Code | Label UI |
|------|----------|
| `waiting_admin` | Diproses Admin |
| `approve_admin` | Diproses Gawi |
| `approve_gawi` | Admin buat PR |
| `create_pr` | Diproses Purchasing |
| `create_po` | Diproses Purchasing |
| `input_im_gr_ttb` | Admin Input No IM GR |
| `gawi_release` | Gawi Release (menunggu Admin TTB) |
| `gawi_hold` | Ditolak |
| `rejected` | Ditolak |
| `selesai` | Selesai |

**Loop perbaikan:** Admin QA reject **atau** GAWI reject → `rejected` → user edit sample → reset ke `waiting_admin` (bisa berulang sampai approve). `gawi_hold` juga bisa diedit user → `waiting_admin`.

```mermaid
---
config:
  theme: dark
---
flowchart TB
  U["User create / edit sample<br/>waiting_admin"] --> QA["Admin QA receive sample<br/>foto awal + label"]
  QA -->|Reject| RJ["rejected / gawi_hold<br/>User perbaiki"]
  RJ -->|edit → waiting_admin| U
  QA -->|Approve → approve_admin| GW["GAWI penawaran & dokumen<br/>approve_admin"]
  GW -->|Reject| RJ
  GW -->|Approve → approve_gawi| PR["Admin input nomor PR<br/>approve_gawi → create_pr"]
  PR --> PO["Purchasing buat nomor PO<br/>create_po"]
  PO --> IM["Admin input IM / GR / TTB<br/>input_im_gr_ttb"]
  PO --> ETO["GAWI input hasil ETO & 2CE<br/>cek kesesuaian PO"]
  ETO -->|Tidak sesuai| RJ
  ETO -->|Sesuai → gawi_release| REL["gawi_release"]
  IM --> FIN(["selesai"])
  REL --> FIN
```

**SVG:** `flowchart_lab-eksternal.svg` (gallery: Lab Eksternal)

---

## Flow C — Daily Activity (ringkas)

```mermaid
---
config:
  theme: dark
---
flowchart LR
  U[User input sample DA] --> Q[Queue approval]
  Q --> AP{Approver approve parameter?}
  AP -->|Ya| OK([Approved])
  AP -->|Belum| Q
```

## Entry points

- Routes: `routes/smart_lab/`
- Controllers: `app/Http/Controllers/SmartLab/`
- Status LE: `app/SmartLab/LabEksternalStatus.php`
