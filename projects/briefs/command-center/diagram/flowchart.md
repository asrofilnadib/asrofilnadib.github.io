---
tags:
  - portfolio
  - flowchart
  - command-center
  - S-tier
  - desktop
aliases:
  - Command Center CCTV Flow
project: Command Center CCTV
tier: S
slug: command-center
platform: Standalone — /home/asrofil/Project/command_center
created: 2026-07-27
---

# Command Center CCTV — Desktop Java + Live + Seamless Playback

> [!info] One-liner
> Multi-CCTV command center: JWT + ACL kamera → MediaMTX WebRTC live grid → playback session seek/speed seamless. Web React + **Desktop JavaFX**.

**Parent:** [[00-Index|Portfolio Flowcharts]]  
**Brief:** `portofolio/projects/briefs/command-center/`

---

## Flowchart — Live + Playback

```mermaid
---
config:
  theme: redux
---
flowchart TB
  L[Login web / desktop JavaFX] --> JWT[JWT + user dept]
  JWT --> CAM[GET /cameras filtered ACL]
  CAM --> GRID[Grid layout / Template]
  GRID --> STR["GET /stream/:id SD/HD"]
  STR --> MTX[Register MediaMTX path]
  MTX --> LIVE[WebRTC live view<br/>WHEP → fallback WS]
  LIVE --> PB[Buka Playback]
  PB --> SES[POST playback session<br/>RTSP NVR → MediaMTX path stabil]
  SES --> PLAY[HLS / WebRTC play]
  PLAY --> SEEK{Seek / Speed?}
  SEEK -->|Seek| UPD[Update session start time]
  SEEK -->|Speed| SPD[Dahua NVR API / rebuild URL]
  UPD --> PLAY
  SPD --> PLAY
  PLAY --> CLOSE[DELETE session → cleanup path]
```

---

## Flowchart — Stack overview

```mermaid
---
config:
  theme: redux
---
flowchart LR
  CAMS[Kamera / NVR] --> MTX[MediaMTX]
  BE[Go Gin backend :8088] --> MTX
  BE --> DB[(MySQL dual)]
  WEB[React frontend] --> BE
  DESK[JavaFX desktop] --> BE
  WD[Watchdog ping] --> DB
  AI[AI worker optional] --> BE
```

## Privacy

> [!danger] Demo
> Blur area sensitif pabrik & wajah. Jangan expose layout security berlebih.

## Entry points

- `/home/asrofil/Project/command_center/Readme.md`
- `desktop/README.md`, `backend/main.go`
- `frontend/src/pages/{Dashboard,Playback}.tsx`
- `desktop/src/main/java/.../CommandCenterApp.java`
