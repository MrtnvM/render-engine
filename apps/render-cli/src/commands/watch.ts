import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'
import { transpile } from '@render-engine/admin-sdk'
import chokidar from 'chokidar'

export const watchCommand = program
  .command('watch')
  .description('Watch a React DSL file for changes and automatically compile and publish to Supabase.')
  .argument('<filePath>', 'Path to the input file without extension (e.g., "src/cart")')
  .option('--supabase-url <url>', 'Supabase project URL. Overrides SUPABASE_URL env var.')
  .option('--supabase-key <key>', 'Supabase service role key. Overrides SUPABASE_SERVICE_KEY env var.')
  .option('--debounce <ms>', 'Debounce delay in milliseconds (default: 300)', '300')
  .action(async (filePath, options) => {
    console.log(chalk.cyan.bold('👀 Starting file watcher...'))

    // --- 1. Resolve File Path (try .tsx and .jsx extensions) ---
    const basePath = path.resolve(process.cwd(), filePath)
    let inputPath: string | null = null

    // Try .tsx first, then .jsx
    const possibleExtensions = ['.tsx', '.jsx']
    for (const ext of possibleExtensions) {
      const candidate = basePath + ext
      if (fs.existsSync(candidate)) {
        inputPath = candidate
        break
      }
    }

    if (!inputPath) {
      console.error(chalk.red.bold(`❌ Error: Could not find file at "${basePath}.tsx" or "${basePath}.jsx"`))
      process.exit(1)
    }

    console.log(chalk.blue(`   Watching file: ${chalk.bold(inputPath)}`))

    // --- 2. Validate Supabase Configuration ---
    const supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = options.supabaseKey || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(chalk.red.bold('❌ Error: Supabase URL and Service Key are required.'))
      console.error(chalk.yellow('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or pass via options.'))
      process.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const debounceMs = parseInt(options.debounce, 10)

    // --- 3. Define Compile and Push Function ---
    const compileAndPush = async () => {
      const timestamp = new Date().toLocaleTimeString()
      console.log(chalk.yellow(`\n[${timestamp}] 🔄 Change detected, compiling and pushing...`))

      // Compile the file
      let schema: any
      try {
        const jsxString = fs.readFileSync(inputPath!, 'utf8')
        schema = await transpile(jsxString)
        console.log(chalk.green(`[${timestamp}]    ✓ Compilation successful`))
      } catch (error: any) {
        console.error(chalk.red.bold(`\n[${timestamp}] ❌ Compilation failed.`))
        console.error(chalk.red(`   Error: ${error.message}`))
        return // Don't exit, keep watching
      }

      // Publish to Supabase
      try {
        if (!schema.key) {
          throw new Error('The compiled schema must have a top-level "key" field.')
        }

        const scenarioKey = schema.key

        // Fetch the latest build version for this key
        const { data: latestBuildData, error: fetchError } = await supabase
          .from('scenario_table')
          .select('build_number, version')
          .eq('key', scenarioKey)
          .order('build_number', { ascending: false })
          .limit(1)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Ignore 'PGRST116' (Row not found)
          throw fetchError
        }

        // Determine the next build number and version
        const latestBuildNumber = latestBuildData ? latestBuildData.build_number : 0
        const latestVersion = latestBuildData ? latestBuildData.version : '1.0.0'
        const nextBuildNumber = latestBuildNumber + 1

        // Prepare and insert the new version
        const rowToInsert = {
          key: scenarioKey,
          mainComponent: schema.main || schema.mainComponent || {},
          components: schema.components || {},
          version: latestVersion,
          build_number: nextBuildNumber,
          metadata: schema.metadata || {},
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('scenario_table')
          .insert(rowToInsert)
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        // Show success message
        console.log(
          chalk.green.bold(
            `[${timestamp}] ✅ Published successfully! (Build: ${insertedData.build_number}, Version: ${insertedData.version})`,
          ),
        )
      } catch (error: any) {
        console.error(chalk.red.bold(`\n[${timestamp}] ❌ Publication failed.`))
        console.error(chalk.red(`   Error: ${error.message}`))
        return // Don't exit, keep watching
      }
    }

    // --- 4. Perform initial compile and push ---
    console.log(chalk.blue('\n📦 Performing initial compile and push...'))
    await compileAndPush()

    // --- 5. Setup File Watcher with Debouncing ---
    let debounceTimer: NodeJS.Timeout | null = null

    const watcher = chokidar.watch(inputPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    })

    watcher.on('change', () => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Set new timer
      debounceTimer = setTimeout(async () => {
        await compileAndPush()
      }, debounceMs)
    })

    watcher.on('error', (error: unknown) => {
      console.error(chalk.red.bold('❌ Watcher error:'), error)
    })

    console.log(chalk.green.bold('\n✨ Watcher is ready! File changes will be automatically compiled and pushed.'))
    console.log(chalk.gray('   Press Ctrl+C to stop watching.\n'))

    // --- 6. Handle graceful shutdown ---
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\n🛑 Stopping watcher...'))
      await watcher.close()
      console.log(chalk.green('✓ Watcher stopped. Goodbye!'))
      process.exit(0)
    })
  })
