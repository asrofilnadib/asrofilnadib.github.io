# Car Pool

Modul MyPAS untuk **peminjaman / pemakaian kendaraan dinas** di PT Prakarsa Alam Segar.

## Flow
1. Pemohon isi form (jadwal, mobil, driver, tujuan)
2. Sistem resolve approver: Dept Head (**Diketahui**) → GA (**Diterima**)
3. Tanda tangan digital dari Master TTD; reject wajib alasan
4. Master Data: daftar request, CRUD kendaraan, chart status

## Status
`waiting_diketahui` → `waiting_diterima` → `approved` | `rejected`
