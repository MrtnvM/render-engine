# Core Backend Module: API for Clients (Fetching Configurations)

## 1. Overview

The **Configuration API** delivers **backend-driven UI (BDUI)** schemas to client applications (Android, iOS, Web).
Clients fetch JSON-based configuration schemas that define complete screen layouts.
The system supports versioning, caching, user segmentation (via external experiment service), and fallback defaults.

---

## 2. Functional Requirements

- Deliver UI schemas in **JSON format** only.
- Provide schema selection based on:

  - `scenario_id`
  - `platform` (ios, android, web)
  - `render_engine_version` (semantic version)
  - `user_id` (for experiment/service lookup)
  - optional `experiment_id` (override from external service)

- Support **semantic versioning**:

  - Each schema has a `schema_version`.
  - Each schema defines required RenderEngine versions.

- Provide **default screen** if requested scenario cannot be delivered.
- Support **caching** with `ETag` and `Last-Modified`.
- Provide **real-time push** (debug-only) over WebSocket.
- **No authentication** required for fetching schemas in MVP.
- **No rate limiting** in MVP.

---

## 3. Non-Functional Requirements

- **Latency:** typical response <100ms.
- **Reliability:** always return a usable schema (fallback if necessary).
- **Offline fallback:** default screen must be bundled in client app.
- **Extensibility:** architecture supports future features (auth, AB tests, conditional logic, etc.).

---

## 4. API Design

### 4.1 REST Endpoints

#### `GET /api/v1/config`

Fetch a configuration schema for a given scenario.

**Query Parameters:**

| Name                    | Type            | Required | Description                                              |
| ----------------------- | --------------- | -------- | -------------------------------------------------------- |
| `scenario_id`           | string          | ✅       | Unique ID of the UI scenario (e.g., `"onboarding_flow"`) |
| `platform`              | enum            | ✅       | Client platform: `ios`, `android`, `web`                 |
| `render_engine_version` | string (semver) | ✅       | Version of the client RenderEngine                       |
| `user_id`               | string          | ❌        | User identifier (used for experiment resolution)         |
| `experiment_id`         | string          | ❌        | Optional override experiment variant                     |

**Request Example:**

```http
GET /api/v1/config?scenario_id=onboarding&platform=ios&render_engine_version=1.2.0&user_id=12345
```

**Response 200 OK:**

```json
{
  "schema_version": "1.4.0",
  "render_engine": {
    "min_version": "1.2.0",
    "max_version": "2.0.0"
  },
  "scenario_id": "onboarding",
  "platform": "ios",
  "last_modified": "2025-09-20T12:30:00Z",
  "etag": "abc123etag",
  "config": {
    "type": "Screen",
    "id": "onboarding_main",
    "children": [
      {
        "type": "Text",
        "props": { "text": "Welcome to Avito!" }
      },
      {
        "type": "Button",
        "props": { "label": "Continue", "action": "next_step" }
      }
    ]
  }
}
```

**Response Headers:**

- `ETag: "abc123etag"`
- `Last-Modified: Sat, 20 Sep 2025 12:30:00 GMT`
- `Cache-Control: max-age=60`

**Error Responses:**

- `404 Not Found` → Scenario not found → Return default schema.
- `409 Conflict` → RenderEngine version not supported → Return previous compatible schema or default schema.
- `500 Internal Server Error` → Server failure → Return default schema.

---

#### `WS /api/v1/debug/config/subscribe`

Subscribe to real-time updates of schemas (debug mode only).

**Message Example (server → client):**

```json
{
  "event": "schema_updated",
  "scenario_id": "onboarding",
  "schema_version": "1.5.0"
}
```

---

### 4.2 Experiment Resolution

- The API will **forward `user_id` and `experiment_id`** to an **external experiment service** only if `experiment_id` and `user_id` are provided.
- The service determines the variant of schema to return.
- If service unavailable → fallback to default variant.

---

## 5. Data Model

### Schema Object

```json
{
  "schema_version": "semver",
  "render_engine": {
    "min_version": "semver",
    "max_version": "semver"
  },
  "scenario_id": "string",
  "platform": "all|mobile|ios|android|web",
  "config": { "…component tree…" }
}
```

### Default Schema

- Each scenario may have its own default.
- A **global default schema** must always exist.

---

## 6. Caching

- `ETag` and `Last-Modified` headers provided in responses.
- Clients must use `If-None-Match` or `If-Modified-Since` for efficient revalidation.
- On schema update: `schema_version` change → reset cache.

---

## 7. Error Handling & Fallbacks

1. **Scenario not found (404):** client displaying error screen.
2. **Unsupported RenderEngine version (409):**

   - client displaying error screen.

3. **Server error (500):** client displaying error screen.
4. **Experiment service failure:** return base variant of schema.

---

## 8. Deployment & Debug

- **MVP Deployment:**

  - REST API for schema fetch.
  - WebSocket endpoint for debug.

- **Debug Tools:**

  - Live reload of schema on connected clients.

- **Observability:**

  - Logs: request/response, fallback usage, experiment resolutions.
  - Metrics: cache hit rate, default schema fallback count.

SEE DIAGRAM: docs/specs/configuration_api_sequence.png (but without default schema logic)
