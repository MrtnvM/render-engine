/// <reference types="node" />
import { defineConfig } from 'drizzle-kit'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const homeDir = os.homedir()
const dbDir = path.join(homeDir, '.render-engine')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const defaultSqliteUrl = `file:${path.join(dbDir, 'database.db')}`
const databaseUrl = process.env.DATABASE_URL || defaultSqliteUrl

export default defineConfig({
  out: './src/kernel/database/migrations',
  schema: './dist/kernel/database/schema.js',
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseUrl,
  },
})
