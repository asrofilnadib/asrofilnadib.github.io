---
tags:
  - portfolio
  - flowchart
  - tms
  - S-tier
aliases:
  - TMS Flow
project: TMS
tier: S
slug: tms
platform: MyPAS
created: 2026-07-27
---

# TMS — Transportation Management System

> [!info] One-liner
> Sistem transportasi internal paling kompleks: SAP → staging → request pengawas → driver → scan muat/bongkar → selesai (+ maps realtime).

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/tms/`

## Actors

| Actor | Peran |
|-------|-------|
| Produksi | Upload dokumen SAP, konfirmasi kedatangan |
| Admin WSM | Dokumen reservasi, approve BAK/komplain |
| Staging | Checklist material siap request |
| Pengawas | Draft/request order (maks 12 palet) |
| Driver | Terima order, muat, kirim, bongkar, pulang |
| Operator / Maps | Monitoring |

## Status utama

`draft → request → pengambilan → pengiriman → selesai` (+ reject / tunda)

---

## Flowchart — Happy Path Outgoing

> [!tip] Copy block di bawah ke Mermaid.ai

```mermaid
---
config:
  theme: redux
---
flowchart TB
  subgraph PRODUKSI
    P1[Upload dokumen SAP]
    P2[Konfirmasi kedatangan material]
  end

  subgraph ADMIN_WSM
    W1[Upload / kelola dokumen reservasi]
    W2{Approve BAK / komplain?}
  end

  subgraph STAGING
    S1[Checklist dokumen & material]
    S2{Siap request?}
  end

  subgraph PENGAWAS
    G1[Buat draft order max 12 palet]
    G2[Store request → status request]
    G3[Broadcast notif ke driver]
  end

  subgraph DRIVER
    D1{Terima order?}
    D2[OTW pengambilan]
    D3[Tiba + scan QR muat]
    D4[Selesai muat → OTW pengiriman]
    D5[Tiba + scan QR bongkar]
    D6[Pulang kosongan → scan selesai]
  end

  P1 --> W1
  W1 --> S1
  S1 --> S2
  S2 -->|Tidak| S1
  S2 -->|Ya| G1
  G1 --> G2 --> G3 --> D1
  D1 -->|Reject| G1
  D1 -->|Accept| D2 --> D3 --> D4 --> D5 --> D6
  D6 --> P2
  P2 --> W2
  W2 -->|Reject| P2
  W2 -->|Approve / close| DONE([Selesai])
```

---

## Flowchart — Status State Machine

```mermaid
---
config:
  theme: redux
---
stateDiagram-v2
  [*] --> draft
  draft --> request: pengawas store-request
  request --> pengambilan: driver terima + OTW
  request --> draft: driver reject
  pengambilan --> pengiriman: selesai muat
  pengiriman --> selesai: selesai bongkar + pulang
  draft --> [*]: delete draft
  pengambilan --> pengambilan: tunda / breakdown
  pengiriman --> pengiriman: tunda / breakdown
```

## Integrasi

- SAP dokumen reservasi
- WebSocket notifikasi driver + maps realtime
- QR scan lokasi muat/bongkar
- Auto logout shift

## Entry points

- Docs: `documentation/Andaru/14. FSD Transportation Management System.md`
- Routes: `routes/tms/`
- Controllers: `app/Http/Controllers/TMS/`
