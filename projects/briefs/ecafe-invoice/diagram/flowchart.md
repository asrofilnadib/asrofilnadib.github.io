---
tags:
  - portfolio
  - flowchart
  - ecafe
  - A-tier
aliases:
  - E-Cafe Invoice Flow
project: E-Cafe Invoice
tier: A
slug: ecafe-invoice
platform: MyPAS
created: 2026-07-27
updated: 2026-07-28
---

# E-Cafe Invoice — Approval 5 Level

> [!info] One-liner
> Generate invoice e-cafe (Makan & Frozen + Scan Produk), approval **sequential 5 level per section**, email notifikasi, PDF.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/ecafe-invoice/`

## Approver chain (per section)

1. Dibuat oleh — Foreman GA
2. Diperiksa oleh — Supervisor GA
3. Diketahui oleh — Chief Supervisor GA
4. Diketahui oleh — Manager HRD
5. Disetujui oleh — Factory Manager Noodle & Seasoning

---

## Flowchart

```mermaid
---
config:
  theme: dark
---
flowchart TB
  U[User hr_ecafesedaap] --> PRE[Preview aggregasi via GaStockEcafeIntegration]
  PRE --> GEN[Generate invoice + 2 sections]
  GEN --> ATT[Upload lampiran FilePond]
  ATT --> S1[Section Makan & Frozen → 5 approval]
  ATT --> S2[Section Scan Produk → 5 approval]

  subgraph APPROVAL_SECTION["Approval sequential per section"]
    A1["Dibuat oleh<br/>Foreman GA<br/>tanda tangan + email next"]
    A2["Diperiksa oleh<br/>Supervisor GA"]
    A3["Diketahui oleh<br/>Chief Supervisor GA"]
    A4["Diketahui oleh<br/>Manager HRD"]
    A5["Disetujui oleh<br/>Factory Manager<br/>Noodle & Seasoning"]
    A1 --> A2 --> A3 --> A4 --> A5
  end

  S1 --> APPROVAL_SECTION
  S2 --> APPROVAL_SECTION
  A5 --> SEC[Section status = approved]
  SEC --> ALL{Semua section approved?}
  ALL -->|Belum| WAIT[Menunggu section lain]
  ALL -->|Ya| INV[Invoice status = approved]
  INV --> PDF([PDF siap])
```

## Catatan penting

- Level N aktif **hanya** jika level N−1 sudah tanda tangan.
- Section Makan & Produk **independen**; invoice approved = AND semua section.
- Integrasi: `GaStockEcafeIntegrationService`, email queue, FilePond storage.

## Entry points

- `app/Http/Controllers/HR/EcafeSedaapInvoiceController.php`
- `routes/hr.php` → `/hr/ecafesedaap/invoice*`
- Views: `resources/views/hr/ecafesedaap/invoice/`
