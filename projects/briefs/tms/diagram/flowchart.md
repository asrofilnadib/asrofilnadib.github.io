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
> Sistem transportasi internal paling kompleks: SAP Excel + picking WSM + staging → draft pengawas → race-accept driver → QR muat/bongkar → maps realtime.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/tms/`

## Actors

| Actor | Peran |
|-------|-------|
| Produksi | Upload Excel SAP, konfirmasi kedatangan / komplain |
| Admin WSM | Picking list per `no_reservasi`, NTI, approve BAK/komplain |
| Staging | Checklist material siap request (`aktif`) |
| Pengawas | Draft/request order (maks 12 palet), QR muat/bongkar |
| Driver | Race-accept, OTW/tiba, scan muat/bongkar, pulang |
| Operator / Maps | TrackTruck Leaflet + WebSocket |

## Status aktual

`draft → request → on_proses → otw_pengambilan → tiba_pengambilan → muat → otw_pengiriman → tiba_pengiriman → bongkar → pulang → selesai`

Reject tetap `request`. Tunda / tolak / breakdown + foto EJO sebagai cabang. Multi tujuan: `to` / `to_2` / `to_3`.

---

## Flowchart — Outgoing + cabang

SVG: `projects/briefs/tms/diagram/flowchart.svg` (cache `?v=3`)

> [!tip] Copy block di bawah ke Mermaid.ai

```mermaid
---
config:
  theme: redux
---
flowchart TB
  subgraph PRODUKSI
    P1[Upload Excel SAP]
    P2{Confirm kedatangan?}
    P3[Request BAK]
  end

  subgraph ADMIN_WSM
    W1[Upload picking list per no_reservasi]
    W2[NTI opsional]
    W3{Approve komplain / BAK?}
  end

  subgraph STAGING
    S1[Checklist dokumen]
    S2[Material aktif]
  end

  subgraph PENGAWAS
    G1[Draft max 12 palet SJ]
    G2[Store-request]
    G3[QR muat / bongkar]
  end

  subgraph DRIVER
    D0{Aktif QR gedung?}
    D1{Race-accept?}
    D2[on_proses SJ jadi DO]
    D3[OTW / tiba pengambilan]
    D4[OTW / tiba pengiriman]
    D5[Pulang kosongan / pergi]
  end

  subgraph SYSTEM
    SYS[WebSocket / Telegram / Leaflet maps]
  end

  P1 --> W1 --> S1 --> S2 --> G1 --> G2 --> SYS
  G2 --> D0
  D0 -->|Tidak| BLOCK[blokir accept]
  D0 -->|Ya| D1
  D1 -->|Reject| G2
  D1 -->|Accept| D2 --> D3 --> G3
  G3 --> D4
  D4 -->|masih ada tujuan| D4
  D4 --> D5 --> P2
  P2 -->|Komplain| W3
  P2 -->|Confirm + foto| W2
  W3 -->|Reject| S1
  P3 --> W3
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
  request --> on_proses: race-accept
  request --> request: driver reject
  on_proses --> otw_pengambilan
  otw_pengambilan --> tiba_pengambilan
  tiba_pengambilan --> muat: QR muat
  muat --> otw_pengiriman
  otw_pengiriman --> tiba_pengiriman
  tiba_pengiriman --> bongkar: QR bongkar
  bongkar --> otw_pengiriman: next to_2 / to_3
  bongkar --> pulang
  pulang --> selesai
  otw_pengambilan --> otw_pengambilan: tunda / breakdown
  otw_pengiriman --> otw_pengiriman: tunda / breakdown
```

## Activity + DFD

- Activity swimlane: `projects/briefs/tms/diagram/activity-diagram.svg`
  Produksi | Admin WSM | Staging | Pengawas | Driver | System
- DFD: `projects/briefs/tms/diagram/dfd.svg`
  Store: `tms_material_reservasi`, `tms_material_reservasi_wsm`, merge tables, `tms_transaction`, `tms_driver`/`tms_car`, `tms_master_konversi_palet`

## Integrasi

- SAP dokumen reservasi (Excel)
- WebSocket notifikasi driver + maps realtime
- Leaflet TrackTruck / TrackTruckProses
- QR scan lokasi muat/bongkar (pengawas atau gedung)
- Telegram sepanjang trip
- Auto logout shift

## Entry points

- Docs: `documentation/Andaru/14. FSD Transportation Management System.md`
- Routes: `routes/tms/`
- Controllers: `app/Http/Controllers/TMS/`
