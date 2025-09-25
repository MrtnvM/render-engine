# Admin Backend

This is the admin backend service built with Hono and Drizzle ORM.

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

The database schema is defined in `src/infrastructure/schema-management/database/schema.table.ts`.

Current tables:

- `scenario_table` - Stores scenario configurations
