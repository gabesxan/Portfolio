## API contract v1 (Codex, 2026-11-16)

Base commit: d154096 on main. API branch: feat/api. UI branch: feat/ui in a separate worktree. Merge order: base -> feat/api -> feat/ui. No push/publish.
Ownership: Antigravity owns src/pages, src/components, src/styles, public/sprites, animation/a11y/mural UI. Codex owns server, src/services, tests, README and integration.
Backend: verified alternate Borá manifest read-only at ChatGPT/BackEnd/ofsw-2026-2-bora-backend: Fastify 5 / TypeScript / Prisma. Portfolio uses Fastify 5 + mysql2 prepared queries and project-owned migrations; no Borá DB/config/credentials.

All endpoints are same-origin under /api (Vite proxy in development); JSON only. No cookies. Errors always {"error":{"code":"VALIDATION_ERROR","message":"Invalid request."}}. Render names as text, never HTML. Admin credentials must never enter frontend code, VITE_ variables or browser storage.

GET /api/signatures?limit=12&cursor=123

- limit integer 1..24 (default12); optional cursor positive decimal string (last ID from prior page).
- 200 {"data":[Signature],"pagination":{"limit":12,"nextCursor":"111","hasMore":true}}; nextCursor null at end. Descending numeric ID; cursor is exclusive. Empty data is valid. RF-14 uses bounded pages of wall cards, no unbounded load/overlap. UI tracks prior cursors for Back; refresh starts first page. No total count.

POST /api/signatures (explicit publish only)

- Content-Type: application/json; <=65536 UTF-8 bytes.
- Body {"name":"Visitor","kind":"text","color":"#153ed5","font":"marker"} OR {"name":"Visitor","kind":"drawing","color":"#153ed5","font":"marker","strokes":[{"width":4,"points":[{"x":0.1,"y":0.2},{"x":0.2,"y":0.3}]}]}.
- name trimmed 1..40 characters, no control characters; name is also the text signature or accessible description of drawing.
- kind text|drawing; color one of #153ed5, #111c42, #4a83ff, #fff9e8; font marker|block|script. These fields required.
- Text MUST omit strokes. Drawing requires 1..64 strokes, each width1..12 and 2..256 normalized points x,y in [0,1]; <=2048 points overall. UI maps normalized coordinates to canvas. No SVG, image data URLs, raw markup, binary uploads or arbitrary styles. Unknown fields rejected.
- 201 {"data":Signature}; Signature includes id (decimal string), name, kind, color, font, strokes (array for drawing, null for text), createdAt (UTC ISO string). Only show success after 201. POST is NOT idempotent: never automatically retry a timed-out publish; reload wall first and explain uncertainty.

DELETE /api/admin/signatures/:id

- Authorization: Bearer <ADMIN_SECRET>, server-only env value >=32 characters. Operational curl/admin command only, no admin UI required.
- 204 empty on deletion; 401 absent/wrong token; 404 missing ID; invalid IDs 400.

Errors: 400 VALIDATION_ERROR (invalid JSON/schema/query/id), 401 UNAUTHORIZED, 404 NOT_FOUND, 413 PAYLOAD_TOO_LARGE, 415 UNSUPPORTED_MEDIA_TYPE, 429 RATE_LIMITED (+Retry-After seconds), 503 SERVICE_UNAVAILABLE for DB failures, 500 INTERNAL_ERROR generic.
Rate limits per direct client IP: GET60/min, POST5/min, DELETE10/min, applied before body parsing; no proxy trust by default. Single process memory only; shared limiter/trusted proxy configuration needed before multi-instance hosting.
Retention/data: only signature fields and server ID/time stored; no IP/contact/tracking in DB. Signatures retained up to365days; read filter plus documented daily cleanup command. Rate-limit IP keys expire within60sec; request logging disabled. Public content is visible to all visitors and removable by operator.
Client interface planned src/services/mural.ts: listSignatures({limit?,cursor?}, signal?), publishSignature(input, signal?). src/services/api.ts exports ApiError with status/code and performs no automatic retries. Reuse these in UI; do not duplicate fetch or invent mock success. Include loading/empty/error/retry and preview/cancel/explicit publish.

Step1 verified: route tests5/5, lint/build pass, npm audit0. No open PRs at inspection. Docker daemon absent; isolated real MySQL test instance will be attempted; otherwise report unverified persistence. Obsidian vault absent.
