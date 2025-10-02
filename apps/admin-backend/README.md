# Admin Backend

This is the admin backend service built with Hono and Drizzle ORM for the Render Engine backend-driven UI framework.

## Overview

The Admin Backend provides a comprehensive REST API for managing UI scenarios, analytics, and real-time configuration updates. It serves as the central hub for the backend-driven UI system, allowing developers to create, update, and distribute UI configurations across multiple platforms (Android, iOS, Web).

## Features

- **Full CRUD operations** for scenario management
- **Advanced filtering, sorting, and pagination** for scenario listing
- **Real-time analytics** for tracking scenario usage and interactions
- **Component validation** to ensure UI schema integrity
- **Cross-platform support** with proper CORS configuration
- **Comprehensive validation** with detailed error messages
- **Legacy endpoint compatibility** for existing integrations

## API Endpoints

### Health & Status
- `GET /health` - Health check endpoint

### Scenarios Management
- `GET /api/scenarios` - List scenarios with filtering, sorting, and pagination
- `POST /api/scenarios` - Create a new scenario
- `GET /api/scenarios/:id` - Get scenario by ID
- `PUT /api/scenarios/:id` - Update scenario by ID
- `DELETE /api/scenarios/:id` - Delete scenario by ID
- `GET /api/scenarios/by-key/:key` - Get scenario by key (for client apps)

### Development Tools
- `POST /api/scenarios/compile` - Compile JSX code to scenario JSON
- `POST /api/scenarios/publish` - Publish compiled scenario (legacy endpoint)

### Analytics
- `POST /api/scenarios/:id/analytics/view` - Log scenario view event
- `POST /api/scenarios/:id/analytics/interaction` - Log component interaction
- `GET /api/scenarios/:id/analytics` - Get scenario analytics summary
- `GET /api/analytics/dashboard` - Get dashboard analytics overview

### Legacy Compatibility
- `GET /json-schema` - Legacy endpoint for backward compatibility

## Request/Response Examples

### Create Scenario
```http
POST /api/scenarios
Content-Type: application/json

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

### List Scenarios with Filtering
```http
GET /api/scenarios?search=profile&sortBy=updatedAt&sortOrder=desc&page=1&limit=10
```

Response:
```json
{
  "data": [
    {
      "id": "uuid-here",
      "key": "user-profile-screen",
      "mainComponent": { ... },
      "components": { ... },
      "version": "1.0.0",
      "buildNumber": 1,
      "metadata": { ... },
      "createdAt": "2023-...",
      "updatedAt": "2023-..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Log Analytics Event
```http
POST /api/scenarios/uuid-here/analytics/interaction
Content-Type: application/json

{
  "componentId": "profile-avatar",
  "interactionType": "tap",
  "platform": "ios",
  "sessionId": "session-123"
}
```

## Database Setup

The project uses Drizzle ORM with PostgreSQL. Make sure you have your `DATABASE_URL` set in the `.env` file.

### Available Database Commands

- **`npm run db:generate`** - Generate migration files based on schema changes
- **`npm run db:migrate`** - Apply migrations to the database
- **`npm run db:push`** - Push schema changes directly to the database (development only)
- **`npm run db:studio`** - Open Drizzle Studio to browse your database
- **`npm run db:seed`** - Run database seeding scripts
- **`npm run db:drop`** - Drop all tables (⚠️ **DANGER: This will delete all data**)

### Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up your database:**
   Make sure your `DATABASE_URL` is set in the `.env` file:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/admin_db
   ```

3. **Generate initial migration:**

   ```bash
   npm run db:generate
   ```

4. **Apply migrations:**

   ```bash
   npm run db:migrate
   ```

5. **(Optional) Seed with sample data:**
   ```bash
   npm run db:seed
   ```

### Development

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build the project
- **`npm run start`** - Start the production server

## Schema

The database schema is defined in `src/infrastructure/schema-management/database/scenario.table.ts`.

Current tables:

- `scenario_table` - Stores scenario configurations

### Scenario Schema

```sql
CREATE TABLE scenario_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  mainComponent JSONB NOT NULL,
  components JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  build_number INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);
```

## Validation

The API includes comprehensive request validation:

- **UUID validation** for ID parameters
- **Required field validation** with custom error messages
- **Type validation** for request bodies
- **Component schema validation** to ensure UI structure integrity
- **Pagination parameter validation** with reasonable limits

## CORS Configuration

The API is configured to accept cross-origin requests from:
- `http://localhost:3000` (React admin panel)
- `http://localhost:5173` (Vite development server)

## Error Handling

All endpoints include consistent error handling with:
- Proper HTTP status codes
- Detailed error messages
- Timestamp information
- Validation error details when applicable

Example error response:
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

## Analytics

The analytics system tracks:
- **View events** - When scenarios are loaded/viewed
- **Interaction events** - User interactions with components
- **Platform distribution** - Usage across Android, iOS, and Web
- **Component popularity** - Most interacted components

Analytics data is currently logged to console but can be easily extended to integrate with services like Firebase Analytics, Amplitude, or custom analytics databases.

## Architecture

The API follows clean architecture principles:

```
src/
├── index.ts                 # Main server setup and route definitions
├── middleware/
│   └── validation.ts        # Request validation middleware
├── types/
│   └── api-types.ts        # TypeScript type definitions
└── infrastructure/
    └── database/
        └── schema.ts        # Database schema definitions
```

## Integration with Frontend

The API is designed to integrate seamlessly with:
- **Admin Panel** (React) - For scenario creation and management
- **Mobile Apps** (iOS/Android) - For fetching scenario configurations
- **Web Apps** (React/Vue/etc) - For real-time UI updates
- **Analytics Dashboards** - For usage insights and monitoring

## Future Enhancements

- **Real-time updates** via WebSocket connections
- **A/B testing** capabilities with experiment management
- **Template management** with inheritance and composition
- **Advanced analytics** with custom metrics and dashboards
- **Caching layer** for improved performance
- **Rate limiting** for API protection
- **Authentication & authorization** for admin operations