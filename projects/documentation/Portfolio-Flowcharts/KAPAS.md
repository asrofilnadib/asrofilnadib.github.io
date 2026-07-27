---
tags:
  - portfolio
  - flowchart
  - kapas
  - A-tier
aliases:
  - KAPAS Flow
project: KAPAS
tier: A
slug: kapas
platform: MyPAS
created: 2026-07-27
---

# KAPAS — Management + Performance + CMS

> [!info] One-liner
> Knowledge portal: department → system → content (CMS) → publish. Plus role mapping, glosarium, monitor chatbot/Gemini.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/kapas/`

> [!note]
> Tidak ada approval workflow konten (publish/unpublish = gate visibility).

---

## Flowchart — Publikasi dokumentasi

```mermaid
---
config:
  theme: redux
---
flowchart TB
  ADM[Admin assign role user] --> DEP[Buat Department]
  DEP --> SYS[Map System ke auth_menus]
  SYS --> CNT[Buat Content + TOC sections + attachments]
  CNT --> PUB{Toggle publish?}
  PUB -->|Unpublish| DRAFT([Hanya admin])
  PUB -->|Publish| LIVE[is_published=true]
  LIVE --> USR[User buka /kapas]
  USR --> READ[Pilih sistem → baca docs]
  READ --> DL[Download attachment]
  ADM --> GLO[Kelola glosarium]
  ADM --> MON[Monitor Gemini / chatbot usage]
```

## Actors

- Admin KAPAS (full CRUD)
- User internal / external (read published)
- Authenticated visitor (landing + overview)

## Entry points

- `documentation/Asrofil/KAPAS_README.md`
- `routes/kapas.php`
- `app/Http/Controllers/KAPAS/`
- `app/Services/KAPAS/KapasContentService.php`
