import type { Client } from "@libsql/client"
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { injectable } from "tsyringe"
import { logger } from "@render-engine/domain"

@injectable()
export class Database {
  private readonly _client: Client
  private readonly _db: LibSQLDatabase
  private readonly logger = logger(Database)

  constructor(client: Client) {
    this._client = client
    this._db = drizzle(this._client)
  }

  get db(): LibSQLDatabase {
    return this._db
  }

  async connect() {
    this.logger.info("Connecting to database")

    try {
      const migrationsFolder = resolveMigrationsFolder()
      this.logger.debug("Using migrations folder", { path: migrationsFolder })

      await migrate(this._db, { migrationsFolder })
      this.logger.info("Database connected successfully")
    } catch (error) {
      this.logger.error("Database migration failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }
  }

  async disconnect() {
    this.logger.info("Disconnecting from database")
    this._client.close()
    this.logger.info("Database disconnected")
  }
}

function resolveMigrationsFolder(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url))

  const candidateFolders = [
    // When running from TS source via tsx/ts-node: src/database
    path.resolve(moduleDir, "kernel/database/migrations"),
    // When running compiled code from dist: dist/database -> ../../src/database/migrations
    path.resolve(moduleDir, "../../../src/kernel/database/migrations"),
    path.resolve(moduleDir, "migrations"),
  ]

  for (const candidate of candidateFolders) {
    const journalPath = path.join(candidate, "meta", "_journal.json")
    if (fs.existsSync(journalPath)) {
      return candidate
    }
  }

  // As a last resort, return the most likely path to help with error context
  return candidateFolders[0]
}
