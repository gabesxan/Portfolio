# Gabriel — full-stack portfolio

React 18 / TypeScript / Vite / React Router. Five routes: `/`, `/projetos`, `/sobre`, `/contato`, `/mural`. All personal biography, projects, skills and contact details remain explicitly provisional until Gabriel supplies them. UI and sprites are owned by Antigravity on `feat/ui`; the initial scaffold is not the finished visual delivery.

## Local setup

Requires Node >=22.12, npm, and Docker Compose (or an independently configured MySQL 8.4+ server).

```sh
npm ci
cp .env.example .env
# Put the output of openssl rand -hex 32 in ADMIN_SECRET in .env.
docker compose -f server/compose.yaml up -d --wait
npm run db:migrate
npm run dev:api
# In another terminal:
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173). Vite proxies `/api` to `127.0.0.1:3001`. Restart processes after changing environment variables. The API binds loopback and fails startup without an adequate admin secret or a reachable database. Migrations are explicit, additive and repeatable; startup does not seed or wipe data.

The local-only Compose service uses container `portfolio-mysql-local`, loopback port `3307`, volume `portfolio_mysql_local`, and databases `portfolio` / `portfolio_test`. Its example credentials are for this isolated local container only. Do not reuse Borá databases, configuration or credentials. `DB_NAME` must begin with `portfolio` and contain only lowercase alphanumeric underscore-separated segments. Never point this setup at a shared database. `docker compose -f server/compose.yaml stop` stops this service without removing persisted data. Do not delete its volume unless its content is intentionally disposable.

`.env` is ignored; `.env.example` contains examples without production secrets. `DB_*`, `API_PORT`, `ADMIN_SECRET`, `TEST_DATABASE_URL` are server-only. Only `VITE_API_BASE_URL` is bundled for browsers; it defaults to `/api` and must never contain credentials. Use dedicated least-privilege database accounts in hosting; runtime needs SELECT/INSERT/DELETE, migration needs CREATE/INDEX, retention cleanup needs DELETE.

## API and mural behavior

See [API contract](server/API.md). `src/services/mural.ts` exports typed list/publish clients and appearance constants. `ApiError` exposes HTTP `status` and error `code`. The browser never receives admin credentials.

- `GET /api/signatures?limit=12&cursor=123`: newest first, exclusive cursor, 1–24 results, `hasMore`/`nextCursor`. Bounded pages satisfy RF-14 without loading the entire wall or overlapping cards. A new first-page refresh shows recent posts; previous-page navigation keeps cursor history in the UI.
- `POST /api/signatures`: explicit publication of text or normalized vector strokes; 201 confirms persistence. Name 1–40 characters, fixed colors/fonts, JSON <=64 KiB, drawing <=64 strokes / 2048 points total. Binary images, SVG uploads, arbitrary styling, unknown fields and invalid coordinates are rejected.
- `DELETE /api/admin/signatures/:id`: operator-only Bearer secret, 204 on success, 401 without correct secret, 404 if missing. No visitor-facing admin login/storage.

POST is not idempotent. A timeout can occur after a successful insert. The client never retries automatically: reload the mural and check before a deliberate new attempt. Loading/empty/error/retry, preview/cancel and explicit publication belong to the UI integration; server-only tests do not prove these browser flows.

Moderate from a trusted operator shell with `ADMIN_SECRET` loaded securely (not a VITE variable):

```sh
curl --fail-with-body -X DELETE http://127.0.0.1:3001/api/admin/signatures/123 \
  -H "Authorization: Bearer ${ADMIN_SECRET}"
```

Keep the secret out of shell history, source code, URLs, frontend storage and logs; rotate it by replacing the server env value and restarting the API. The configured secret must be >=32 characters; generate a unique random value, do not use an example. Public marks need operator review; there is no automated content moderation.

Trust boundaries: public JSON is schema validated, queries use prepared parameters, names are rendered as React text, and drawings consist only of bounded points. No uploaded markup is executed. Admin tokens are hashed and compared in constant time. Security headers are applied to API responses; errors exclude SQL details and secrets. Request logging is disabled. No cookies or cross-origin browser access are configured; same-origin reverse proxy is the production model.

Rate limits use direct socket IP: reads60/min, publishes5/min, deletes10/min, before parsing. Forwarded IP headers are ignored. The memory store is bounded to5000 keys and has a60-second window; restart resets it. This is a single-process local implementation. Before public hosting, configure a trusted ingress that preserves per-client rate limiting, enforce ingress body/connection limits, and use a shared limiter for multiple API processes. The development Vite proxy aggregates visitors behind its loopback IP and is not a production abuse boundary.

Only public name/appearance/drawing and server-generated ID/time enter MySQL. No email, tracking or IP is stored in the database. Rate limiting temporarily holds IP keys in process memory. Marks older than365days are hidden by list queries. Schedule `npm run db:cleanup` daily to physically remove expired rows; until scheduled cleanup runs, hidden expired rows remain stored. Backup retention must follow the same policy. Visitors should be told that marks are public, retained for up to365days with daily cleanup, and removable through the operator. Do not claim cleanup is scheduled by these instructions.

## Validation

```sh
npm test                 # boundary/client/routes; real DB case skips if URL is absent
npm run test:db          # reads .env; requires TEST_DATABASE_URL
npm run lint
npm run typecheck:api
npm run build
npm run format:check
npm audit
```

`TEST_DATABASE_URL` must target a database named `portfolio_test` or `portfolio_*_test`; the test refuses foreign names. Compose provisions `portfolio_test` only during first initialization of its own volume. The integration test applies the additive migration, inserts only its own marks, uses independent pools/API instances, verifies text/drawing persistence, pagination, protected removal and expiry filtering, then deletes only IDs it created. It does not reset the database. Do not run concurrently against a busy/shared test database. API unit tests use a repository stub and do not prove persistence; the opt-in MySQL test is the persistence evidence.

## Architecture and technical choice

The initially requested `/Users/gabriel/Documents/bora-*-backend` path was unavailable. Read-only inspection of `ChatGPT/BackEnd/ofsw-2026-2-bora-backend/package.json` and its server entry verified Node/TypeScript, Fastify5 and Prisma. This portfolio keeps Fastify and TypeScript; mysql2 prepared statements plus one SQL migration cover its small single-table model without introducing Prisma code generation. The portfolio has its own DB, env, SQL and runtime. No Borá env files or credentials were read/copied.

`src/pages`, `src/components`, `src/styles` hold UI; `src/data` holds labeled provisional content; `src/services` holds HTTP client/types. `server` holds configuration, validation, routes and persistence. Tests are in `tests`. Branch integration order is base onmain, `feat/api`, then `feat/ui`, preserving each owner's changes. No push or publication is authorized.

## Hosting preparation (not deployed)

Build with `npm run build`; serve `dist` as static files. Route `/api/*` through the same HTTPS origin to the private loopback API and route every other non-file URL to `index.html` so direct route access/refresh works. Preserve API 404/status/body responses; do not rewrite failed API requests to HTML. Configure headers/CSP for the static frontend at the host; API Helmet headers do not protect separately served HTML. Set server environment values and run migrations explicitly. This repository does not provision hosting, configure an ingress or schedule retention. A static-only host cannot persist mural posts.

Pending external/product inputs: verified biography/projects/stacks/contact links, final wall design and moderation ownership. Validate the merged UI in real desktop/mobile browsers against MySQL before claiming the full product is complete.
