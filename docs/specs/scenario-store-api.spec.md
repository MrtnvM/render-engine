# Scenario Store API Specification

## Overview

Central service for persisting, versioning, and distributing backend-driven UI scenarios. The store exposes a key/value style interface where each `scenario_id` maps to a stream of immutable JSON snapshots plus derived diffs. It enables real-time updates to connected renderers without app redeployment and forms the source of truth for admin/editor tooling.

## Existing Implementation Cues

- CLI publishes complete schemas into Supabase `schema_table` with sequential integer `version` and a nested `schema` payload that repeats the scenario body (`apps/render-cli/src/commands/publish.ts:35`).
- iOS renderers fetch `schema_table` ordered by `version` to render the latest record and fall back to HTTP JSON at `https://localhost:3035/json-schema` (`apps/render-ios-playground/render-ios-playground/SDK/RenderSDK.swift:22`, `apps/render-ios-playground/render-ios-playground/SDK/RenderViewController.swift:96`).
- Renderers expect the payload to contain `id`, `version`, `metadata`, and a `schema.main` component tree (`apps/render-ios-playground/render-ios-playground/Domain/Entities/Scenario.swift:22`).
- Realtime subscriptions reuse Supabase channels but currently do not scope to a table/filters and only push full replacements (`apps/render-ios-playground/render-ios-playground/Infrastructure/Repositories/ScenarioRepositoryImpl.swift:50`).
- Admin backend simply returns the first row in `schema_table` without version negotiation or filtering (`apps/admin-backend/src/index.ts:16`).
- Sample scenario JSON shows flat component configuration without per-node diffs or metadata expansion (`apps/render-cli/src/playground.json:1`).

These insights guide gaps the store must close: strict schema contract, version-aware access, scoped realtime topics, and formal diff management.

## Goals

1. Provide a robust persistence model for scenarios, treating each version as an immutable snapshot.
2. Offer a simple key/value API surface (`scenario_id` → latest schema) augmented with history queries.
3. Deliver deterministic notifications so renderers/admin tools receive updates in near real time.
4. Produce and expose structural diffs to support preview, audit, and safe rollbacks.
5. Maintain backwards compatibility with current renderers while enabling richer metadata.

## Functional Requirements

- **CRUD Boundaries**
  - Create: publish a new scenario version by `scenario_id`.
  - Read: fetch latest, specific version, version list, and diffs.
  - Update/Delete: forbidden; supersede by publishing new versions, optionally mark versions as soft-deleted.
- **Versioning**
  - Enforce monotonically increasing integer `version` scoped per `scenario_id`.
  - Reject out-of-order publishes unless flagged as replay of archived version.
- **Payload Validation**
  - Validate required fields (`id`, `schema.main`, component types) before persisting.
  - Auto-populate `metadata` (timestamps, author, channel, change summary).
- **Realtime Notifications**
  - Emit change events (`scenario.updated`) to subscribers with version pointers and optional diffs.
  - Guarantee at-least-once delivery, deduplicate via `(scenario_id, version)`.
- **Diff Exposure**
  - Generate JSON-Patch style diffs (`RFC 6902`) between consecutive versions.
  - Provide API to fetch diff summary (added/removed component IDs, property deltas).
- **Audit & Rollback**
  - Store immutable history, allow admin tools to mark a previous version as active via pointer update.
  - Keep publish provenance (who published, optional commit hash).

## Data Model

### Primary Table: `scenario_versions`

| Column            | Type          | Notes |
|-------------------|---------------|-------|
| `scenario_id`     | `text`        | Partition key; references logical scenario. |
| `version`         | `int4`        | Monotonic per `scenario_id`; composite PK with `scenario_id`. |
| `payload`         | `jsonb`       | Canonical scenario snapshot; includes `schema`, `metadata`, etc. |
| `hash`            | `uuid`        | Deterministic hash of canonical payload; aids deduplication. |
| `author_id`       | `text`        | Optional user id from admin/editor. |
| `source`          | `text`        | E.g. `admin-ui`, `cli`, `api`. |
| `created_at`      | `timestamptz` | Default `now()`. |
| `is_active`       | `bool`        | True when pointed to by `scenario_heads`. |

Indexes:
- `PRIMARY KEY (scenario_id, version)`
- `UNIQUE (scenario_id, hash)` to suppress identical publishes.
- `INDEX ON scenario_id WHERE is_active` for quick latest lookup.

### Heads Table: `scenario_heads`

| Column        | Type    | Notes |
|---------------|---------|-------|
| `scenario_id` | `text`  | Primary key. |
| `version`     | `int4`  | Points to active version. |
| `locked_by`   | `text`  | Optional lock owner for manual QA freeze. |
| `locked_at`   | `timestamptz` | When lock applied. |

Used to flip active version without rewriting history. `is_active` flag maintained through triggers.

### Diffs Table: `scenario_diffs`

| Column            | Type    | Notes |
|-------------------|---------|-------|
| `scenario_id`     | `text`  | FK to `scenario_versions`. |
| `from_version`    | `int4`  | Lower version. |
| `to_version`      | `int4`  | Higher version. |
| `diff_patch`      | `jsonb` | RFC 6902 operations array. |
| `summary`         | `jsonb` | Aggregated metrics (component counts, property changes). |
| `created_at`      | `timestamptz` | Default `now()`. |

Materialized when a publish occurs. Derived from canonicalized payloads to ensure stable diffs.

## Storage & Canonicalization Strategy

- Treat Postgres (Supabase) as the key/value store. Each publish writes a new row keyed by `(scenario_id, version)` while the heads table provides constant-time lookup akin to KV `GET`.
- Canonicalize JSON before hashing/diffing: sort object keys, normalize numeric types, strip nulls unless significant. Aligns with renderer expectations that rely on deterministic `schema.main` structure (`apps/render-ios-playground/render-ios-playground/Domain/Entities/Scenario.swift:28`).
- Store supplemental metadata (authors, release notes) inside `payload.metadata` while exposing critical fields as relational columns for querying.

## API Surface

### REST Endpoints (Admin & Renderers)

1. `GET /scenarios/{scenario_id}`
   - Returns active version snapshot plus metadata and hash.
   - Query params: `?version=<int>` for specific version, `?at=<timestamp>` for time-travel (first version created before timestamp).

2. `GET /scenarios/{scenario_id}/versions`
   - Paginated list with `version`, `created_at`, `author`, `hash`, `release_notes`.

3. `POST /scenarios/{scenario_id}`
   - Body: `{ schema: {...}, metadata?: {...}, releaseNotes?: string }`.
   - Requires `If-Match` header with last known version to enforce optimistic concurrency.
   - Response: `{ version, hash, diffSummary }`.

4. `POST /scenarios/{scenario_id}/activate`
   - Body: `{ version }`; flips head pointer.

5. `GET /scenarios/{scenario_id}/diff/{from}/{to}`
   - Returns stored JSON Patch plus summary (component added/removed counts).

6. `GET /scenarios/{scenario_id}/stream`
   - Server-Sent Events or WebSocket upgrade streaming `{ scenario_id, version, hash, diffSummary }`.

### CLI Alignment

- CLI continues to target REST instead of direct DB writes; uses `POST /scenarios/{scenario_id}` and handles `409` conflicts (currently handled via Supabase call `apps/render-cli/src/commands/publish.ts:68`).
- Legacy Supabase direct insert remains until clients migrate; run both paths during transition.

## Realtime Notifications

- Backed by Postgres logical replication (Supabase Realtime) or dedicated event bus.
- Channel naming: `scenario:{scenario_id}` to avoid collision with generic `scenario-<id>` strings (`apps/render-ios-playground/render-ios-playground/Infrastructure/Repositories/ScenarioRepositoryImpl.swift:59`).
- Payload: `{ scenario_id, version, previous_version, hash, diff_summary, activated }`.
- Emit on new publish and on head activation changes.
- Renderers subscribe and, upon receiving event newer than local, call `GET /scenarios/{id}?version=...` to fetch canonical payload.

## Diff Generation

1. Normalize both payloads (remove volatile metadata fields like timestamps, sort arrays when order is semantic-neutral).
2. Compute structural diff using library that outputs JSON Patch and summary (added/removed nodes, property changes).
3. Persist patch in `scenario_diffs`; include `sha256` for integrity.
4. Provide helper to project diff summary into UI-friendly format (counts by component type, textual change summary).
5. Allow recomputation if canonicalization rules change (store versioned canonicalization recipe in metadata).

## Consistency & Concurrency

- Use DB transaction: insert new version row, create diff, update head pointer if publish flagged `activateImmediately`.
- Optimistic concurrency: require publishers to send `expectedVersion`; reject if mismatch with latest.
- Provide `dryRun=true` flag to validate schema and generate diff without committing.
- Locking: `scenario_heads.locked_by` prevents accidental head flips during QA; attempts to publish when locked either fail or require override token.

## Observability & Auditing

- Audit log table referencing `scenario_id`, `version`, `action`, `actor`, `context` (CLI vs admin UI). Useful for compliance.
- Emit metrics: publish latency, diff generation duration, subscriber fan-out count, failure rate.
- Logs tagged by `scenario_id` to aid tracing across services.

## Security & Access Control

- Require authenticated requests; enforce role-based permissions (editor, reviewer, reader).
- Validate payload size limits (e.g., 256 KB) to protect renderers.
- Sanitize user-provided metadata to avoid injection into renderer contexts.

## Migration Plan

1. Backfill existing Supabase rows into `scenario_versions`, setting `version` from stored payload and computing hashes.
2. Populate `scenario_heads` with highest version per `scenario_id`.
3. Generate baseline diffs for all consecutive pairs.
4. Update renderers to prioritize REST `GET /scenarios/{id}`; fall back to Supabase direct query while flag enabled.
5. Deprecate legacy `/json-schema` endpoint once REST path verified.

## Testing Strategy

- Unit: schema validation, diff generator (edge cases like array reorder, numeric type change).
- Integration: publish/fetch workflow, concurrent publish conflict, realtime end-to-end using mock subscriber.
- Contract: ensure payload consumed by iOS `Scenario.create` remains compatible (`apps/render-ios-playground/render-ios-playground/Domain/Entities/Scenario.swift:22`).
- Performance: measure publish throughput, SSE stream fan-out under load.

## Open Questions

- Should diffs ignore cosmetic style adjustments or surface them for analytics?
- Do we need per-component level subkeys to allow partial updates, or will full snapshot replacement remain acceptable?
- What retention policy applies to historical versions/diffs?
- How to expose analytics metadata (e.g., usage metrics) alongside scenario payload without overloading renderer contract?

## Metadata

- Status: Draft
- Authors: Store API team
- Last Updated: 2025-02-14
- Related Code: `apps/render-cli`, `apps/admin-backend`, `apps/render-ios-playground`
