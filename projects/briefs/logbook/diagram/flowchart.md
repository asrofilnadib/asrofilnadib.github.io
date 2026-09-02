---
tags:
  - portfolio
  - flowchart
  - logbook
  - A-tier
aliases:
  - Logbook Flow
project: Logbook Magang
tier: A
slug: logbook
platform: MyPAS
created: 2026-07-27
updated: 2026-09-02
---

# Logbook — Absensi Scale + Approval 2 Level + Clip Periode

> [!info] One-liner
> Logbook magang/PKL: merge kegiatan + `t_absensi`, approval SPV then Manager, clip join/end mid-periode untuk export & claim uang saku.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/logbook/`

Runtime SVGs (portfolio owl-carousel):

- `flowchart.svg` — proses lengkap
- `activity-diagram.svg` — swimlane Intern / SPV / Manager / System
- `dfd.svg` — actors + stores

## Status logbook

`pending_paraf` → `ready_spv` → `spv_signed` → `manager_signed`

## Clip overlap (2026-09-02)

- Periode kalender claim: **21 bulan N s/d 20 bulan N+1**
- `internStart` = min(`created_at`, MIN tanggal logbook)
- `clipStart` = max(internStart, start 21)
- `clipEnd` = min(MAX tanggal log, end 20)
- Contoh: join **5 Juli**, finish **16 Agustus**
- Berlaku Magang **dan** PKL di export + claim uang saku (periode + jumlah hari)

## Claim uang saku

- **Magang:** Rp 3.6jt / periode, proporsional x jumlah hari overlap
- **PKL:** hari hadir x tarif (ENG 100rb / Non-ENG 50rb)

## Actors

- Magang / PKL intern
- PIC / SPV
- Manager
- Admin Master Magang
- Absensi server (`t_absensi`)
