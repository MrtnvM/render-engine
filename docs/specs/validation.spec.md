# 📑 Full Spec — Backend Core: Schema Validation

## 🎯 Goal

Deliver a **working, enforceable schema validation system** for backend-driven UI, ensuring:

- Safe and consistent **UI configurations**.
- Valid and predictable **scenario data** (Store API state).
- Enforced **business logic rules** and **security constraints**.
- Usable both **backend-side** (save/publish) and **client-side** (runtime safety).

---

## 1. Validation Targets

1. **UI Configurations**

   - JSON definition of screens, components, properties, styles, bindings.
   - Must follow structural schema + business rules.

2. **Scenario Data**

   - Key–value store of dynamic state (Store API).
   - Must conform to type/range/pattern validation.
   - Integrated with **ValidationOptions** in Store API.

3. **Business Logic Rules**

   - Conditional requirements (e.g., Button must have label).
   - Constraints on values (e.g., URLs must be HTTPS).

4. **Security**

   - Reject unknown component types.
   - Sanitize user-facing text and inputs.
   - Enforce whitelisted formats (URL, color).

---

## 2. Schema Model

- **Master JSON Schema** (`draft-07+`) defines the root configuration.
- **Per-Component Schemas** included via `$ref`.
- **Scenario Data Schema**: mirrors Store API `StoreValue` type system.
- **Versioning**:

  - Semantic version: `major.minor.patch`.
  - Major version bump drops scenario data (no migrations).
  - Configs tied to schema version; outdated ones blocked at publish.

---

## 3. Validation Flow

### 3.1 Backend

- **Admin Save**: validate config + scenario data, block on error.
- **Publish**: re-validate before rollout, block on error.
- **Nightly Job**: batch re-validate all configs, log/report mismatches.

### 3.2 Client

- **Fetch Config**: validate before rendering; fallback UI on error.
- **Store Writes**:

  - **Strict mode**: reject invalid write.
  - **Lenient mode**: coerce or apply default.

---

## 4. Error Handling

- **Blocking policy**: invalid configs are rejected at save/publish.
- **Structured error response**:

```json
{
  "errors": [
    {
      "path": "$.components[1].props.text",
      "expected": "string (non-empty)",
      "received": 123,
      "message": "Button.text must be a non-empty string"
    },
    {
      "path": "$.scenarioData.cart.total",
      "expected": "number ≥ 0",
      "received": -5,
      "message": "cart.total must be non-negative"
    }
  ]
}
```

- Admin UI displays errors inline.
- All failures logged and monitored.

---

## 5. Extensibility

- **Custom Validators**:

  - Regex, min/max ranges, cross-field conditions.
  - Example: `image.url` must be HTTPS if `component.type=image`.

- **Pluggable Schemas**:

  - New components can be added modularly (schema fragment + validators).

---

## 6. Security

- **Input sanitization**:

  - Strip unsafe HTML/scripts.
  - Enforce safe URL protocols (https\:// only).

- **Whitelisting**:

  - Only registered component types allowed.
  - Reject unrecognized scenario data keys unless schema allows.

---

## 7. Integration with Store API

- Store-level validation uses same schema rules:

  - Maps to `ValidationRule` (`kind`, `required`, `default`, `min`, `max`, `pattern`).

- Live expressions validated before registration:

  - Output path must exist and be writable.
  - Dependencies must resolve to valid keys.

---

## 8. Performance

- Validation checkpoints: save, publish, nightly batch, client-side writes.
- No cache of validated configs (always re-validate).
- Performance budget:

  - Config ≤500KB: <100ms validation.
  - Store writes: <1ms each.

---

## 9. Monitoring

- **Metrics**:

  - % invalid configs at save/publish.
  - Store write failure rate (strict/lenient).

- **Alerts**:

  - Trigger if nightly validation >5% fails.

- **Debug Inspector** (dev only):

  - Show key paths, active subscriptions, patch log, failed validations.

---

## 10. Deliverables

- ✅ Master JSON Schema
- ✅ Component schemas (Button, Label, List, Banner as baseline)
- ✅ Validation library (backend + client)
- ✅ Error reporting format
- ✅ Store API integration
- ✅ Nightly validation job
- ✅ Debug inspector

---

## 11. Master JSON Schema (Draft)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/bdui.schema.json",
  "title": "Backend-Driven UI Configuration",
  "description": "Master schema for UI configurations and scenario data.",
  "type": "object",
  "required": ["version", "components"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "createdBy": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "additionalProperties": false
    },
    "components": {
      "type": "array",
      "items": { "$ref": "#/definitions/component" },
      "minItems": 1
    },
    "scenarioData": {
      "type": "object",
      "additionalProperties": { "$ref": "#/definitions/storeValue" }
    }
  },

  "definitions": {
    "component": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string", "enum": ["Button", "Label", "List", "Banner"] },
        "props": {
          "type": "object",
          "additionalProperties": true
        },
        "children": {
          "type": "array",
          "items": { "$ref": "#/definitions/component" }
        },
        "bindings": {
          "type": "object",
          "additionalProperties": { "type": "string" }
        }
      },
      "allOf": [{ "$ref": "#/definitions/componentRules" }],
      "additionalProperties": false
    },

    "componentRules": {
      "oneOf": [
        {
          "properties": {
            "type": { "const": "Button" },
            "props": {
              "type": "object",
              "required": ["text"],
              "properties": {
                "text": { "type": "string", "minLength": 1 },
                "onClick": { "type": "string", "pattern": "^action:.+" }
              },
              "additionalProperties": false
            }
          }
        },
        {
          "properties": {
            "type": { "const": "Label" },
            "props": {
              "type": "object",
              "required": ["text"],
              "properties": {
                "text": { "type": "string" }
              },
              "additionalProperties": false
            }
          }
        },
        {
          "properties": {
            "type": { "const": "List" },
            "props": {
              "type": "object",
              "required": ["items"],
              "properties": {
                "items": {
                  "type": "array",
                  "items": { "$ref": "#/definitions/component" }
                }
              },
              "additionalProperties": false
            }
          }
        },
        {
          "properties": {
            "type": { "const": "Banner" },
            "props": {
              "type": "object",
              "required": ["imageUrl"],
              "properties": {
                "imageUrl": { "type": "string", "format": "uri", "pattern": "^https://" },
                "action": { "type": "string", "pattern": "^action:.+" }
              },
              "additionalProperties": false
            }
          }
        }
      ]
    },

    "storeValue": {
      "oneOf": [
        { "type": "string" },
        { "type": "number" },
        { "type": "integer" },
        { "type": "boolean" },
        {
          "type": "string",
          "pattern": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$"
        },
        {
          "type": "string",
          "format": "uri",
          "pattern": "^https://"
        },
        {
          "type": "array",
          "items": { "$ref": "#/definitions/storeValue" }
        },
        {
          "type": "object",
          "additionalProperties": { "$ref": "#/definitions/storeValue" }
        },
        { "type": "null" }
      ]
    }
  }
}
```

### List component runtime model

- `props.items` defines the static template for each cell as an array of component definitions.
- Optional `data.items` may override the initial items at load time using the same component schema.
- Optional `data.itemsStoreKeyPath` (or `data.items.keyPath`) binds the list to a store key path. The store value must be an array (or object map) of component definitions that match the component schema above.
- The iOS renderer virtualizes rows with `UITableView` + diffable data source, so only the visible cells mount child components while still responding to live store updates.

---

✅ This final spec ensures **end-to-end schema validation** for UI configs and scenario data, directly aligned with the **Store API doc** you shared.
