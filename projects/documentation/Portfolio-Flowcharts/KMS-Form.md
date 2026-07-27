---
tags:
  - portfolio
  - flowchart
  - kms-form
  - compliance
  - A-tier
aliases:
  - KMS Form Flow
project: KMS Form
tier: A
slug: kms-form
platform: Standalone — /home/asrofil/Project/compliance-form-app
created: 2026-07-27
---

# KMS Form — Compliance Form App

> [!info] One-liner
> Form dinamis (survey/quiz) untuk compliance/training: validasi NIK via Google Sheets, simpan Firestore, grade quiz, sync laporan training.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/kms-form/`

---

## Flowchart — Peserta isi form

```mermaid
---
config:
  theme: redux
---
flowchart TB
  A[Buka /f/:slug] --> B{Form published & dalam window?}
  B -->|Tidak| X1([Closed / expired / belum buka])
  B -->|Ya| C[Input NIK + tanggal lahir]
  C --> D{Lookup Sheets OK?}
  D -->|Tidak| C
  D -->|Ya| E{oneResponsePerNik & sudah submit?}
  E -->|Ya| X2([Block duplikat])
  E -->|Tidak| F[Isi jawaban + draft localStorage]
  F --> G[Submit → Firestore responses]
  G --> H{Mode quiz?}
  H -->|Ya| I[Grade vs answerKeys]
  H -->|Tidak| J[Skip grade]
  I --> K[Sync Training Report → Google Sheet]
  J --> K
  K --> L([Done + optional score])
```

---

## Flowchart — Admin manage

```mermaid
---
config:
  theme: redux
---
flowchart LR
  L[Admin Firebase login] --> D[Dashboard forms]
  D --> E[Edit sections & questions]
  E --> S[Settings: draft/published/closed]
  S --> P[Publish → /f/:slug]
  D --> R[Lihat responses + export CSV]
```

## Status form

`draft → published → closed` · mode `survey | quiz`

## Entry points

- `/home/asrofil/Project/compliance-form-app/README.md`
- `src/pages/public/FormPage.jsx`
- `backend/app/api/{lookup-nik,grade-quiz,sync-training-report}/`
- Firestore + Google Sheets SA
