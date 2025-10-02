#!/usr/bin/env node

import 'dotenv/config'
import { Command } from 'commander'
import chalk from 'chalk'
import { renderCommand } from './commands/render.js'
import { compileCommand } from './commands/compile.js'
import { publishCommand } from './commands/publish.js'
import { pushCommand } from './commands/push.js'
import { watchCommand } from './commands/watch.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const version = packageJson.version

const program = new Command()

program.name('render').description('CLI tool for Render Engine').version(version)

// Add commands
program.addCommand(renderCommand)
program.addCommand(compileCommand)
program.addCommand(publishCommand)
program.addCommand(pushCommand)
program.addCommand(watchCommand)

// Global error handling
program.configureHelp({
  sortSubcommands: true,
})

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Error:'), error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('Error:'), reason)
  process.exit(1)
})

program.parse()
