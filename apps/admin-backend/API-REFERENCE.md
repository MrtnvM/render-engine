# Scenarios API Reference

Complete REST API documentation for the Render Engine Admin Backend scenarios management system.

## Base URL

```
http://localhost:3050
```

## Authentication

Currently, no authentication is required (development setup). In production, you would add authentication middleware.

---

## Health & Status

### Health Check
Check if the API server is running and healthy.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Scenarios Management

### List All Scenarios
Get a paginated list of scenarios with optional filtering and sorting.

```http
GET /api/scenarios
```

**Query Parameters:**
- `search` (string, optional) - Search in scenario key and version
- `version` (string, optional) - Filter by specific version
- `sortBy` (string, optional) - Sort field: `createdAt`, `updatedAt`, `version`, `key` (default: `updatedAt`)
- `sortOrder` (string, optional) - Sort direction: `asc`, `desc` (default: `desc`)
- `page` (number, optional) - Page number, min: 1 (default: 1)
- `limit` (number, optional) - Items per page, min: 1, max: 100 (default: 10)

**Example:**
```http
GET /api/scenarios?search=profile&sortBy=updatedAt&sortOrder=desc&page=1&limit=5
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "key": "user-profile-screen",
      "mainComponent": {
        "type": "container",
        "style": { "padding": "16px" },
        "children": [...]
      },
      "components": {},
      "version": "1.0.0",
      "buildNumber": 1,
      "metadata": {
        "author": "john.doe@example.com",
        "description": "User profile screen layout"
      },
      "createdAt": "2023-12-07T10:00:00.000Z",
      "updatedAt": "2023-12-07T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 42,
    "totalPages": 9,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Create Scenario
Create a new scenario configuration.

```http
POST /api/scenarios
Content-Type: application/json
```

**Request Body:**
```json
{
  "key": "user-profile-screen",
  "mainComponent": {
    "type": "container",
    "style": { "padding": "16px" },
    "children": [
      {
        "type": "text",
        "properties": { "text": "User Profile" },
        "style": { "fontSize": "24px" }
      }
    ]
  },
  "components": {},
  "version": "1.0.0",
  "metadata": {
    "author": "john.doe@example.com",
    "description": "User profile screen layout"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "key": "user-profile-screen",
  "mainComponent": { ... },
  "components": {},
  "version": "1.0.0",
  "buildNumber": 1,
  "metadata": { ... },
  "createdAt": "2023-12-07T10:30:00.000Z",
  "updatedAt": "2023-12-07T10:30:00.000Z"
}
```

### Get Scenario by ID
Retrieve a specific scenario by its UUID.

```http
GET /api/scenarios/{id}
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "key": "user-profile-screen",
  "mainComponent": { ... },
  "components": { ... },
  "version": "1.0.0",
  "buildNumber": 1,
  "metadata": { ... },
  "createdAt": "2023-12-07T10:30:00.000Z",
  "updatedAt": "2023-12-07T10:30:00.000Z"
}
```

### Get Scenario by Key
Retrieve a scenario by its key (used by client applications).

```http
GET /api/scenarios/by-key/{key}
```

**Parameters:**
- `key` (string, required) - Scenario key

**Response:** Same as Get Scenario by ID

### Update Scenario
Update an existing scenario. All fields are optional - only provided fields will be updated.

```http
PUT /api/scenarios/{id}
Content-Type: application/json
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Request Body (all fields optional):**
```json
{
  "key": "updated-profile-screen",
  "mainComponent": {
    "type": "container",
    "style": { "padding": "20px" }
  },
  "components": {
    "custom-button": {
      "type": "button",
      "properties": { "text": "Click Me" }
    }
  },
  "version": "1.1.0",
  "metadata": {
    "author": "jane.doe@example.com",
    "description": "Updated profile screen",
    "lastUpdated": "2023-12-07"
  }
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "key": "updated-profile-screen",
  "mainComponent": { ... },
  "components": { ... },
  "version": "1.1.0",
  "buildNumber": 1,
  "metadata": { ... },
  "createdAt": "2023-12-07T10:30:00.000Z",
  "updatedAt": "2023-12-07T11:00:00.000Z"
}
```

### Delete Scenario
Permanently delete a scenario.

```http
DELETE /api/scenarios/{id}
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Response:** `200 OK`
```json
{
  "message": "Scenario deleted successfully"
}
```

---

## Development Tools

### Compile JSX to JSON
Compile JSX code into a scenario JSON configuration.

```http
POST /api/scenarios/compile
Content-Type: application/json
```

**Request Body:**
```json
{
  "jsxCode": "const App = () => <div><h1>Hello World</h1></div>"
}
```

**Response:**
```json
{
  "key": "compiled-scenario",
  "main": {
    "type": "div",
    "children": [
      {
        "type": "h1",
        "properties": { "text": "Hello World" }
      }
    ]
  },
  "components": {},
  "version": "1.0.0",
  "metadata": {}
}
```

### Publish Scenario (Legacy)
Legacy endpoint for publishing compiled scenarios. This endpoint will upsert scenarios based on the key.

```http
POST /api/scenarios/publish
Content-Type: application/json
```

**Request Body:**
```json
{
  "key": "my-scenario",
  "main": {
    "type": "container",
    "children": [...]
  },
  "components": {},
  "version": "1.0.0",
  "metadata": {}
}
```

**Response:** Same as Create Scenario

---

## Analytics

### Log View Event
Log when a scenario is viewed/loaded by a client application.

```http
POST /api/scenarios/{id}/analytics/view
Content-Type: application/json
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Request Body (all fields optional):**
```json
{
  "platform": "ios",
  "userAgent": "MyApp/1.0 iOS/16.0",
  "sessionId": "session-abc123"
}
```

**Response:**
```json
{
  "message": "View event logged",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Log Interaction Event
Log user interactions with scenario components.

```http
POST /api/scenarios/{id}/analytics/interaction
Content-Type: application/json
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Request Body:**
```json
{
  "componentId": "profile-avatar",
  "interactionType": "tap",
  "platform": "ios",
  "userAgent": "MyApp/1.0 iOS/16.0",
  "sessionId": "session-abc123",
  "metadata": {
    "duration": 150,
    "coordinates": { "x": 100, "y": 200 }
  }
}
```

**Response:**
```json
{
  "message": "Interaction event logged",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Get Scenario Analytics
Get analytics summary for a specific scenario.

```http
GET /api/scenarios/{id}/analytics
```

**Parameters:**
- `id` (UUID, required) - Scenario ID

**Response:**
```json
{
  "scenarioId": "123e4567-e89b-12d3-a456-426614174000",
  "totalViews": 1250,
  "totalInteractions": 890,
  "platforms": {
    "android": 450,
    "ios": 520,
    "web": 280
  },
  "topComponents": [
    {
      "componentId": "profile-avatar",
      "interactions": 230
    },
    {
      "componentId": "edit-button",
      "interactions": 180
    }
  ],
  "timeRange": {
    "start": "2023-11-30T10:30:00.000Z",
    "end": "2023-12-07T10:30:00.000Z"
  }
}
```

### Get Dashboard Analytics
Get overall analytics dashboard data.

```http
GET /api/analytics/dashboard
```

**Response:**
```json
{
  "totalScenarios": 42,
  "totalViews": 15680,
  "totalInteractions": 8920,
  "recentScenarios": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "key": "user-profile-screen",
      "version": "1.0.0",
      "updatedAt": "2023-12-07T10:30:00.000Z"
    }
  ],
  "platformStats": {
    "android": 6200,
    "ios": 5800,
    "web": 3680
  },
  "timeRange": {
    "start": "2023-11-07T10:30:00.000Z",
    "end": "2023-12-07T10:30:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses with appropriate HTTP status codes.

### Validation Error (400 Bad Request)
```json
{
  "error": "Validation failed",
  "details": [
    "key is required",
    "mainComponent must be an object"
  ],
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Not Found Error (404 Not Found)
```json
{
  "error": "Scenario not found",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Conflict Error (409 Conflict)
```json
{
  "error": "Scenario with this key already exists",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

---

## Legacy Compatibility

### Get JSON Schema (Legacy)
Legacy endpoint for backward compatibility.

```http
GET /json-schema
```

**Response:** Returns the first scenario in the database or null if no scenarios exist.

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, you should implement rate limiting to prevent abuse.

## CORS

The API accepts cross-origin requests from:
- `http://localhost:3000` (React admin panel)
- `http://localhost:5173` (Vite development server)

## Testing

Use the included test script to validate API functionality:

```bash
npx tsx src/test-api.ts
```

This will run a comprehensive test suite covering all endpoints.