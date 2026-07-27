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
---

# Psikotes — Computer Vision + Image Verification

> [!info] One-liner
> Ujian online + face enrollment/verify (InsightFace) + proctor YOLO (person count) + React/Laravel/MySQL.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/psikotes/`

---

## Flowchart — End-to-end

```mermaid
---
config:
  theme: redux
---
flowchart TB
  subgraph ADMIN
    A1[Import bank soal Excel]
    A2[Upload foto → Face enroll embedding]
    A3[Issue token ± kirim WA Fonnte]
  end

  subgraph PESERTA
    P1[Input token /exam]
    P2{Token valid + face enrolled?}
    P3[JWT + pending_camera]
    P4[Capture frame → verify-face gate]
    P5{Match embedding?}
    P6[active — kerjakan soal]
    P7[Proctor frame YOLO]
    P8{person>1 atau face_mismatch?}
    P9[paused_violation]
    P10[Submit / timeout]
  end

  A1 --> A2 --> A3
  A3 --> P1 --> P2
  P2 -->|Tidak| X1([Reject])
  P2 -->|Ya| P3 --> P4 --> P5
  P5 -->|Tidak| P4
  P5 -->|Ya| P6 --> P7 --> P8
  P8 -->|Ya| P9
  P9 --> SAFE{Kondisi aman / re-verify?}
  SAFE -->|Ya| P6
  P8 -->|Tidak| P10
  P10 --> DONE{Submit?}
  DONE -->|Ya| C([completed])
  DONE -->|Timeout| E([expired])
```

---

## Flowchart — Session states

```mermaid
---
config:
  theme: redux
---
stateDiagram-v2
  [*] --> pending_camera
  pending_camera --> active: face gate OK
  active --> paused_violation: proctor violation
  paused_violation --> active: re-verify / aman
  active --> completed: submit
  active --> expired: timer
  active --> terminated: admin/system
```

## Privacy

> [!danger] Saat rekam demo
> Blur wajah kandidat real, KTP, data personal. Pakai dummy.

## Entry points

- `/home/asrofil/Project/psikotes/README.md`
- `routes/api.php`, `routes/admin.php`
- `python/proctor-service/` (YOLO + InsightFace)
