---
tags:
  - portfolio
  - flowchart
  - ga-stock
  - A-tier
aliases:
  - GA Stock Opname Flow
project: GA Stock Opname
tier: A
slug: ga-stock-opname
platform: MyPAS
created: 2026-07-27
---

# GA Stock Opname — TV Websocket Display

> [!info] One-liner
> Stock opname GA: baseline + mutasi in/out + catering → balance realtime di **TV board** via websocket (`ga-stock-board`).

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/ga-stock-opname/`

> [!warning] Bukan FACStokOpname
> `fac/so` beda modul. Yang ini = `hr/ga-stock`.

---

## Flowchart

```mermaid
---
config:
  theme: redux
---
flowchart TB
  M[Master item GA aktif] --> OP[Baseline opname per shift]
  OP --> MOV[Mutasi masuk / keluar]
  CAT[Catering / E-Cafe scan] --> AUTO[Auto outgoing mie cup]
  MOV --> BAL[GaStockBalanceService<br/>balance = opname + in − out]
  AUTO --> BAL
  BAL --> EVT[Broadcast GaStockBoardUpdated]
  EVT -->|channel ga-stock-board| TV[TV Board /hr/ga-stock/opname?tv=1]
  EVT -.->|fallback poll 60s| TV
  TV --> UI([Kartu stok update realtime])
```

## Actors

- GA staff (`hr_ga_stock_*`)
- TV viewer (`?tv=1`)
- E-Cafe integration (sumber catering)

## Entry points

- Routes: `routes/hr-ga-stock.php`
- Event: `app/Events/HR/GaStock/GaStockBoardUpdated.php`
- TV: `resources/views/hr/ga-stock/opname/tv.blade.php`
