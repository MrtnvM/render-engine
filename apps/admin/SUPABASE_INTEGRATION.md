# Supabase Integration - Сценарии (Scenarios)

This document describes the integration of the Scenarios (Сценарии) section with Supabase in the Render Engine Admin application.

## Overview

The Scenarios section has been fully integrated with Supabase to provide real-time data management for UI scenarios. The integration includes:

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ React Query for data fetching and caching
- ✅ Optimistic updates with automatic cache invalidation
- ✅ Row-level security policies
- ✅ Bulk delete operations
- ✅ Loading and error states
- ✅ Toast notifications for user feedback

## Setup Instructions

### 1. Database Setup

Run the migration SQL script to create the necessary table in your Supabase database:

```bash
# Option 1: Through Supabase Dashboard
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of `supabase-migration.sql`
# 4. Click "Run"

# Option 2: Using Supabase CLI
supabase db push --file apps/admin/supabase-migration.sql
```

### 2. Environment Variables

Ensure the following environment variables are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Authentication

Users must be authenticated to access the Scenarios section. The integration uses Supabase Auth which is already configured in the application.

## Database Schema

### Table: `scenario_table`

| Column        | Type      | Description                       |
| ------------- | --------- | --------------------------------- |
| id            | UUID      | Primary key (auto-generated)      |
| key           | TEXT      | Unique scenario identifier        |
| mainComponent | JSONB     | Main component configuration      |
| components    | JSONB     | Array of component configurations |
| version       | TEXT      | Semantic version (e.g., "1.0.0")  |
| build_number  | INTEGER   | Build number                      |
| metadata      | JSONB     | Additional metadata               |
| created_at    | TIMESTAMP | Timestamp when created            |
| updated_at    | TIMESTAMP | Timestamp when last updated       |

### Indexes

- `idx_scenario_table_key` - On `key` column for fast lookups
- `idx_scenario_table_updated_at` - On `updated_at` for sorting

### Row-Level Security Policies

All policies require user authentication:

- **SELECT**: Authenticated users can read all scenarios
- **INSERT**: Authenticated users can create scenarios
- **UPDATE**: Authenticated users can update scenarios
- **DELETE**: Authenticated users can delete scenarios

## Architecture

### File Structure

```
apps/admin/src/features/tasks/
├── hooks/
│   └── use-scenarios.ts          # React Query hooks for data fetching
├── context/
│   └── tasks-context.tsx         # Context provider with data state
├── components/
│   ├── tasks-mutate-drawer.tsx   # Create/Update form
│   ├── tasks-dialogs.tsx         # Dialog orchestration
│   ├── data-table-toolbar.tsx    # Table toolbar with bulk actions
│   └── ...
├── data/
│   └── schema.ts                 # Zod schema and TypeScript types
└── index.tsx                     # Main page component
```

### Key Components

#### 1. Hooks (`use-scenarios.ts`)

Contains React Query hooks:

- `useScenarios()` - Fetch all scenarios
- `useScenario(id)` - Fetch single scenario
- `useCreateScenario()` - Create scenario mutation
- `useUpdateScenario()` - Update scenario mutation
- `useDeleteScenario()` - Delete single scenario mutation
- `useDeleteScenarios()` - Delete multiple scenarios mutation

#### 2. Context (`tasks-context.tsx`)

Provides:

- Scenarios data and loading states
- Dialog state management
- Delete operations

#### 3. Forms (`tasks-mutate-drawer.tsx`)

Features:

- Create new scenarios
- Edit existing scenarios
- Form validation with Zod
- Loading states during submission
- Localized in Russian

## Usage Examples

### Fetching Scenarios

```tsx
import { useScenarios } from '@/features/tasks/hooks/use-scenarios'

function MyComponent() {
  const { data: scenarios, isLoading, isError } = useScenarios()

  if (isLoading) return <div>Загрузка...</div>
  if (isError) return <div>Ошибка загрузки</div>

  return (
    <div>
      {scenarios.map((scenario) => (
        <div key={scenario.id}>{scenario.key}</div>
      ))}
    </div>
  )
}
```

### Creating a Scenario

```tsx
import { useCreateScenario } from '@/features/tasks/hooks/use-scenarios'

function CreateButton() {
  const createMutation = useCreateScenario()

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      key: 'new-scenario',
      version: '1.0.0',
      build_number: 1,
      mainComponent: { type: 'Screen' },
      components: [],
      metadata: {},
    })
  }

  return (
    <button onClick={handleCreate} disabled={createMutation.isPending}>
      {createMutation.isPending ? 'Создание...' : 'Создать'}
    </button>
  )
}
```

### Updating a Scenario

```tsx
import { useUpdateScenario } from '@/features/tasks/hooks/use-scenarios'

function UpdateButton({ scenarioId }) {
  const updateMutation = useUpdateScenario()

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      id: scenarioId,
      updates: {
        version: '2.0.0',
        build_number: 2,
      },
    })
  }

  return <button onClick={handleUpdate}>Обновить</button>
}
```

### Deleting a Scenario

```tsx
import { useDeleteScenario } from '@/features/tasks/hooks/use-scenarios'

function DeleteButton({ scenarioId }) {
  const deleteMutation = useDeleteScenario()

  const handleDelete = () => {
    deleteMutation.mutate(scenarioId)
  }

  return <button onClick={handleDelete}>Удалить</button>
}
```

## Features

### 1. Real-time Data Synchronization

- Uses React Query for automatic caching and synchronization
- Cache invalidation on mutations ensures data consistency
- Optimistic updates for better UX

### 2. Form Validation

Create/Update form validates:

- **Key**: Must be lowercase, alphanumeric with hyphens only
- **Version**: Must follow semantic versioning (x.y.z)
- **Build Number**: Must be a positive integer
- **Main Component**: Required field

### 3. Bulk Operations

- Select multiple scenarios using checkboxes
- Bulk delete with single click
- Progress indicator shows number of selected items

### 4. Search and Filter

- Search scenarios by key
- Real-time filtering in the table
- Reset filters functionality

### 5. Toast Notifications

Success/error notifications for:

- Creating scenarios
- Updating scenarios
- Deleting scenarios
- Bulk operations

## Troubleshooting

### Issue: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"

**Solution**: Add the required environment variables to your `.env` file.

### Issue: "Error loading scenarios"

**Solutions**:

1. Check that the Supabase table exists and migration was run
2. Verify authentication is working
3. Check RLS policies are correctly set up
4. Verify network connectivity to Supabase

### Issue: "Permission denied" when creating/updating

**Solutions**:

1. Ensure user is authenticated
2. Check RLS policies allow the operation
3. Verify the user's role has necessary permissions

### Issue: Database conflicts on key

**Solution**: The `key` field must be unique. Use a different key or update the existing scenario instead.

## Migration from Hardcoded Data

The old hardcoded data in `apps/admin/src/features/tasks/data/tasks.ts` is no longer used. The application now fetches data directly from Supabase.

To migrate existing data:

1. Run the Supabase migration SQL
2. Optional: Use the sample data insert statements in the migration file
3. Or create scenarios through the UI

## Performance Considerations

- React Query caches data for 5 minutes by default
- Mutations automatically invalidate and refetch affected queries
- Pagination can be added if the number of scenarios grows large
- Consider implementing virtual scrolling for very large datasets

## Security

- All operations require authentication
- Row-level security is enabled
- Only authenticated users can perform CRUD operations
- API keys should never be committed to version control

## Future Enhancements

Potential improvements:

- [ ] Scenario versioning and history
- [ ] Export/Import scenarios as JSON
- [ ] Scenario templates
- [ ] Advanced filtering (by version, date range)
- [ ] Pagination for large datasets
- [ ] Real-time collaboration with Supabase Realtime
- [ ] Scenario duplication
- [ ] Tags and categories

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Supabase documentation: https://supabase.com/docs
3. Review React Query documentation: https://tanstack.com/query
4. Check the project README
