---
tags:
  - portfolio
  - flowchart
  - scada
  - S-tier
aliases:
  - SCADA to Tablet Flow
project: SCADA to Tablet
tier: S
slug: scada-tablet
platform: MyPAS
created: 2026-07-27
---

# SCADA to Tablet — Trigger + WhatsApp + Websocket

> [!info] One-liner
> Pipeline event SCADA/DB → **MySQL trigger** → queue → **Fonnte WhatsApp**, plus jalur tablet downtime & display websocket.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/scada-tablet/`

> [!note] Multi-lane
> Di codebase ini ada beberapa jalur yang saling nempel. Diagram utama = Lane A (WA via trigger). Lane B/C supporting.

---

## Flowchart — Lane A (portfolio hook utama)

```mermaid
---
config:
  theme: redux
---
flowchart TB
  PLC[PLC / SCADA INSERT notif_eng_p2] --> TRG[MySQL Trigger<br/>after_notif_eng_p2_insert]
  TRG --> Q[notif_queue status=pending]
  Q --> DISP[php artisan notif:dispatch]
  DISP --> JOB[Job ProcessNotifEng]
  JOB --> CHK{NOTIFICATIONS_ENABLED?}
  CHK -->|false| SKIP([skipped])
  CHK -->|true| WA[Fonnte WhatsApp API]
  WA --> OK{Kirim sukses?}
  OK -->|Ya| SENT([status=sent])
  OK -->|Tidak| FAIL([status=failed + retry])
```

---

## Flowchart — Lane B + C (Tablet & Display)

```mermaid
---
config:
  theme: redux
---
flowchart TB
  OP[Operator login NIK] --> TAB[Tablet Seas2 Downtime Menu]
  TAB --> TX[Transaksi downtime / breakdown]
  TX -->|WS seas2-breakdown-monitoring| DSP[Display monitor TV]
  TX --> LIFE[Lifecycle ticket:<br/>created → ack → in_progress → solved → closed]
```

---

## Flowchart — Overview gabungan (buat PPT)

```mermaid
---
config:
  theme: redux
---
flowchart LR
  subgraph ALERT
    PLC[PLC Event] --> TRG[DB Trigger] --> Q[Queue] --> WA[WhatsApp]
  end
  subgraph FLOOR
    TAB[Tablet UI] --> BRK[Breakdown Tx] --> DSP[Websocket Display]
  end
  subgraph REPORT
    SCD[ScadaDashboard] --> GR[(SCADA DB graphs)]
  end
```

## Entry points

- `app/Jobs/ProcessNotifEng.php`
- `app/Console/Commands/DispatchNotifEngJobs.php`
- `app/Services/WhatsApp/FonnteService.php`
- `routes/seas_2_downtime.php`, `routes/scada-dashboard.php`
- Docs: `deploy/supervisor/README.md`
