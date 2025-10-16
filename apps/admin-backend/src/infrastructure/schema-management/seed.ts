import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { scenarioTable, type Scenario } from '@render-engine/admin-backend-infrastructure/database/schema.js'

// Initialize the database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Example seed data - customize as needed
    const sampleScenarios: Scenario[] = []

    // Insert sample data
    for (const scenario of sampleScenarios) {
      await db.insert(scenarioTable).values(scenario)
      console.log(`✅ Inserted scenario: ${scenario.metadata['name']}`)
    }

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the seed function
seed()
