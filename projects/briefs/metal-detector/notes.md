# Metal Detector Proses

Modul MyPAS **Seasoning 2 · PRS2** untuk logging pengecekan metal detector di lantai produksi. Route: `/cek-md-proses`.

## Flow
1. Operator buka form, meta auto-isi shift + nomor cek + kuota
2. Isi Line + Tanggal; 4 section varian unik (Bagor, Koya, Kremes, SO4)
3. Tiap varian: Fe 0.7 / Non Fe 1.0 / SUS 1.5 → OK | NOT OK
4. Max 3 cek per line per shift (`lockForUpdate`)
5. Report filter + Export Excel (header sama dengan form)

## Tables
- `md_proses_variants`
- `md_proses_checks`
- `md_proses_check_items`
