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
---

# E-Cafe Invoice — Approval 5 Level

> [!info] One-liner
> Generate invoice e-cafe (Makan & Frozen + Scan Produk), approval **sequential 5 level per section**, email notifikasi, PDF.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/ecafe-invoice/`

## Approver chain (per section)

1. Dibuat oleh — Melati
2. Diperiksa Oleh — Musahidin
3. Diketahui oleh — Nancy
4. Diketahui oleh — Yongki
5. Disetujui Oleh — Linda

---

## Flowchart

```mermaid
---
config:
  theme: redux
---
flowchart TB
  U[User hr_ecafesedaap] --> PRE[Preview aggregasi via GaStockEcafeIntegration]
  PRE --> GEN[Generate invoice + 2 sections]
  GEN --> ATT[Upload lampiran FilePond]
  ATT --> S1[Section Makan & Frozen → 5 slots]
  ATT --> S2[Section Scan Produk → 5 slots]

  subgraph APPROVAL_SECTION["Approval sequential per section"]
    A1[Slot 1 tanda tangan + email next]
    A2[Slot 2]
    A3[Slot 3]
    A4[Slot 4]
    A5[Slot 5]
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

- Slot N aktif **hanya** jika slot N−1 sudah tanda tangan.
- Section Makan & Produk **independen**; invoice approved = AND semua section.
- Integrasi: `GaStockEcafeIntegrationService`, email queue, FilePond storage.

## Entry points

- `app/Http/Controllers/HR/EcafeSedaapInvoiceController.php`
- `routes/hr.php` → `/hr/ecafesedaap/invoice*`
- Views: `resources/views/hr/ecafesedaap/invoice/`
