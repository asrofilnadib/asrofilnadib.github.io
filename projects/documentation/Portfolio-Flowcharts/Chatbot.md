---
tags:
  - portfolio
  - flowchart
  - chatbot
  - S-tier
aliases:
  - Chatbot Flow
project: Chatbot
tier: S
slug: chatbot
platform: MyPAS
created: 2026-07-27
---

# Chatbot — Qdrant + Gemini + Query Execution

> [!info] One-liner
> Chat berkonteks: embed → **Qdrant retrieve** → Gemini Text-to-SQL → **ReadOnly SQL validator** → execute → jawab (table/chart).

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/chatbot/`

---

## Flowchart — Pipeline aktif (`context_qdrant`)

```mermaid
---
config:
  theme: redux
---
flowchart TB
  U[User kirim pesan ± lampiran] --> API[POST /chatbot/pas-query]
  API --> CONV[Buat / lanjut conversation]
  CONV --> EMB[Embed pertanyaan]
  EMB --> QD[Qdrant search collection konteks]
  QD --> HIT{Ada hit?}
  HIT -->|Tidak| ASK([Minta ingest konteks])
  HIT -->|Ya| GEM[Gemini Text-to-SQL]
  GEM --> VAL{ReadOnlySqlValidator<br/>SELECT aman?}
  VAL -->|Tolak| REJ([Tidak dieksekusi])
  VAL -->|Lolos| SQL[Execute SQL di MySQL target]
  SQL --> ERR{MySQL error?}
  ERR -->|Ya| REP[Repair 1x ke Gemini]
  REP --> VAL
  ERR -->|Tidak| FMT[Format table / chart]
  FMT --> SAVE[Simpan message + token usage]
  SAVE --> RESP([Response ke user])
```

---

## Flowchart — Admin ingest (supporting)

```mermaid
---
config:
  theme: redux
---
flowchart LR
  ADM[Admin siapkan konteks JSON] --> ING[pas:chatbot-ingest-context]
  ING --> QDR[(Qdrant collection)]
  QDR --> READY([Siap di-retrieve chatbot])
```

## Guardrails yang wajib diceritain

- Hanya SELECT (validator)
- Feature flag `pas_chatbot.enabled`
- Attachment size/MIME limit
- KAPAS monitor usage Gemini

## Entry points

- `routes/chatbot.php`
- `app/Services/PasChatbot/PasChatbotQueryService.php`
- `TextToSqlGeminiService.php`, `ReadOnlySqlValidator.php`
- Controllers: `app/Http/Controllers/PasChatbot/`
