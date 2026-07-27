---
tags:
  - portfolio
  - flowchart
  - prayer
  - B-tier
aliases:
  - Prayer Flow
project: Prayer
tier: B
slug: prayer
platform: MyPAS
created: 2026-07-27
---

# Prayer — Display Masjid

> [!info] One-liner
> Halaman display jadwal sholat + ayat; refresh cron + websocket update ke TV lobby.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/prayer/`

> [!tip] B-tier
> Cukup screenshot bagus. Diagram ini opsional buat kelengkapan.

---

## Flowchart

```mermaid
---
config:
  theme: redux
---
flowchart LR
  API[Aladhan + Quran API] --> CTRL[PrayerController]
  CRON[prayer:refresh times/verse] --> EVT[Broadcast events]
  CTRL --> UI[/prayer TV display]
  EVT -->|Echo prayer-times / prayer-verse| UI
  EVT -.->|fallback poll| UI
```

## Entry points

- `routes/prayer.php`
- `app/Http/Controllers/Prayer/PrayerController.php`
- `prayer-portal/` → `public/js/prayer/PrayerPortal.js`
