---
tags:
  - portfolio
  - flowchart
  - psikotes
  - S-tier
  - computer-vision
aliases:
  - Psikotes Flow
project: Psikotes
tier: S
slug: psikotes
platform: Standalone — /home/asrofil/Project/psikotes
created: 2026-07-27
updated: 2026-07-29
---

# Psikotes — Face enroll + YOLO proctor exam

> [!info] One-liner
> Ujian online: bank soal → token + face enroll (InsightFace) → WhatsApp (Fonnte) → gate verify → ujian + YOLO proctor → skor digital.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/psikotes/`  
**Code:** `/home/asrofil/Project/psikotes`

## Actors

Admin / HR-PIC · Peserta (token, tanpa akun) · Proctor service (YOLO + InsightFace) · Fonnte WhatsApp

## Session status

| Status | Artinya |
|--------|---------|
| `pending_camera` | Token masuk, menunggu face gate |
| `active` | Ujian berjalan |
| `paused_violation` | Multi-person / face mismatch |
| `completed` | Submit sukses |
| `expired` | Timer habis |

---

## Flowchart — proses bisnis

```mermaid
---
config:
  theme: dark
---
flowchart TB
  A1[Admin import bank soal Excel] --> A2[Buat token + upload foto]
  A2 --> A3{Face enroll OK?<br/>1 wajah + liveness}
  A3 -->|Gagal| A2
  A3 -->|OK embedding 512-d| A4{Ada no. HP?}
  A4 -->|Ya| A5[Kirim token via Fonnte WA]
  A4 -->|Tidak| A6[Token siap]
  A5 --> A6

  A6 --> P1[Peserta buka /exam + input token]
  P1 --> P2{Token redeemable?<br/>aktif + face enrolled}
  P2 -->|Reject| P1
  P2 -->|OK / resume| P3[pending_camera + JWT]
  P3 --> P4[Gate verify-face]
  P4 --> P5{Wajah match?}
  P5 -->|Gagal| P3
  P5 -->|Lolos| P6[active — kerjakan soal]

  P6 --> P7[Proctor YOLO person count]
  P6 --> P8[Periodic face verify]
  P7 --> P9{person > 1?}
  P8 --> P10{Face mismatch?}
  P9 -->|Ya| PV[paused_violation]
  P10 -->|Ya| PV
  P9 -->|Tidak| P6
  P10 -->|Tidak| P6
  PV --> SAFE{Kondisi aman?}
  SAFE -->|Tidak| PV
  SAFE -->|Ya| P6

  P6 --> END{Submit / timer?}
  END -->|Submit| C([completed])
  END -->|Timer habis| E([expired])
  C --> R[Admin rekap skor otomatis]
  E --> R
```

**SVG:** `flowchart.svg`

## Entry points

- `README.md`
- `routes/admin.php`, `routes/api.php`, `routes/web.php`
- `python/proctor-service/` — `/enroll`, `/verify`, `/detect`
- Services: `FaceEnrollmentService`, `FaceVerificationService`, `ViolationHandler`, `FonnteGateway`
