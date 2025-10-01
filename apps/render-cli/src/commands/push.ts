import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'
import { transpile } from '../sdk/transpiler/transpiler.js'

export const pushCommand = program
  .command('push')
  .description('Compile and publish a React DSL file to Supabase.')
  .argument('<filePath>', 'Path to the input file without extension (e.g., "src/cart")')
  .option('--supabase-url <url>', 'Supabase project URL. Overrides SUPABASE_URL env var.')
  .option('--supabase-key <key>', 'Supabase service role key. Overrides SUPABASE_SERVICE_KEY env var.')
  .action(async (filePath, options) => {
    console.log(chalk.cyan.bold('🚀 Starting compile and publish...'))

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

    console.log(chalk.blue(`   Found file: ${chalk.bold(inputPath)}`))

    // --- 2. Compile the File ---
    let schema: any
    try {
      console.log(chalk.yellow('   Compiling React DSL to JSON schema...'))
      const jsxString = fs.readFileSync(inputPath, 'utf8')
      schema = await transpile(jsxString)
      console.log(chalk.green('   ✓ Compilation successful'))
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Compilation failed.'))
      console.error(chalk.red(`   Error: ${error.message}`))
      process.exit(1)
    }

    // --- 3. Validate Supabase Configuration ---
    const supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = options.supabaseKey || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(chalk.red.bold('❌ Error: Supabase URL and Service Key are required.'))
      console.error(chalk.yellow('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or pass via options.'))
      process.exit(1)
    }

    // --- 4. Publish to Supabase ---
    try {
      if (!schema.key) {
        throw new Error('The compiled schema must have a top-level "key" field.')
      }

      const scenarioKey = schema.key
      console.log(chalk.blue(`   Schema Key: ${chalk.bold(scenarioKey)}`))

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Fetch the latest build version for this key
      console.log(chalk.yellow('   Checking for the latest build version...'))

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

      console.log(
        chalk.blue(
          `   Publishing build number ${chalk.bold(nextBuildNumber)} with version ${chalk.bold(latestVersion)}.`,
        ),
      )

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
      console.log(chalk.green.bold('\n✅ Scenario published successfully!'))
      console.log(
        chalk.gray(
          `   Record created for Key: ${insertedData.key}, Version: ${insertedData.version}, Build: ${insertedData.build_number}`,
        ),
      )
      console.log(chalk.gray(`   Published at: ${new Date(insertedData.created_at || new Date()).toLocaleString()}`))
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Scenario publication failed.'))
      console.error(chalk.red(`   Error: ${error.message}`))
      process.exit(1)
    }
  })
