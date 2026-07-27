---
tags:
  - portfolio
  - flowchart
  - asrofil
  - moc
aliases:
  - Portfolio Flowcharts
  - MOC Portfolio Diagrams
created: 2026-07-27
---

# Portfolio Flowcharts — Map of Content

> [!abstract] Tujuan
> Kumpulan **flowchart proses bisnis** (Mermaid) buat project yang pernah dikerjain Asrofil.
> Copy blok Mermaid → paste ke [mermaid.ai](https://mermaid.ai) → Export image → taruh di `portofolio/projects/briefs/{slug}/diagram/`.

## Cara pakai

1. Buka note project di bawah.
2. Copy **blok Mermaid** (yang ada `config: theme: redux`).
3. Paste ke Mermaid.ai → Export PNG/SVG.
4. Simpan sebagai `process.png` di folder briefs yang sesuai.

## Tier

| Tier | Project | Note |
|------|---------|------|
| **S** | [[TMS]] · [[Smart-Lab]] · [[SCADA-to-Tablet]] · [[Chatbot]] · [[Psikotes]] · [[Command-Center-CCTV]] | Full treatment |
| **A** | [[E-Cafe-Invoice]] · [[GA-Stock-Opname]] · [[KAPAS]] · [[Logbook]] · [[TimbanginIN]] · [[P2H]] · [[KMS-Form]] | Seadaanya |
| **B** | [[Prayer]] | Screenshot only (diagram tetap ada, simpel) |

## Index cepat

### MyPAS — gede
- [[TMS]] — Transportasi Management (paling kompleks)
- [[Smart-Lab]] — PA + Lab eksternal
- [[E-Cafe-Invoice]] — Approval 5 level
- [[GA-Stock-Opname]] — Websocket TV board
- [[SCADA-to-Tablet]] — MySQL trigger + WA + websocket
- [[Logbook]] — Absensi scale + approval 2 level
- [[P2H]] — Inspeksi MHE + downtime
- [[Chatbot]] — Qdrant + Gemini + SQL execution
- [[KAPAS]] — Docs CMS + performance
- [[TimbanginIN]] — Modbus realtime scale

### MyPAS — kecil
- [[Prayer]] — Display masjid

### Di luar MyPAS
- [[Psikotes]] — CV + face verification
- [[Command-Center-CCTV]] — Desktop Java + live/playback
- [[KMS-Form]] — Compliance form (Firestore + Sheets)

## Folder mirror (portofolio)

```
/home/asrofil/Project/portofolio/projects/briefs/{slug}/diagram/
```

Source notes (Obsidian):

```
documentation/Asrofil/Portfolio-Flowcharts/
```

## Related

- [[KAPAS_README]]
- Portofolio briefs: `portofolio/projects/briefs/README.md`
