import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'

function incrementSemanticVersion(version: string): string {
  const [major, minor, patch] = version.split('.').map(Number)
  return `${major}.${minor}.${patch + 1}`
}

export const publishCommand = program
  .command('publish')
  .description('Publish a new version of a JSON scenario to Supabase.')
  .argument('<inputFile>', 'Path to the input JSON scenario file.')
  .option('--supabase-url <url>', 'Supabase project URL. Overrides SUPABASE_URL env var.')
  .option('--supabase-key <key>', 'Supabase service role key. Overrides SUPABASE_SERVICE_KEY env var.')
  .action(async (inputFile, options) => {
    console.log(chalk.cyan.bold('🚀 Starting scenario publication...'))

    const supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = options.supabaseKey || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(chalk.red.bold('❌ Error: Supabase URL and Service Key are required.'))
      process.exit(1)
    }

    try {
      const inputPath = path.resolve(process.cwd(), inputFile)
      if (!fs.existsSync(inputPath)) throw new Error(`Input file not found: ${inputPath}`)

      const schema = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
      if (!schema.key) throw new Error('The input JSON must have a top-level "key" field.')

      const scenarioKey = schema.key
      console.log(chalk.blue(`   Schema Key: ${chalk.bold(scenarioKey)}`))

      const supabase = createClient(supabaseUrl, supabaseKey)

      // --- 1. Fetch the latest build version for this key ---
      console.log(chalk.yellow('   Checking for the latest build version...'))

      const { data: latestBuildData, error: fetchError } = await supabase
        .from('scenario_table')
        .select('build_number, version')
        .eq('key', scenarioKey)
        .order('build_number', { ascending: false }) // Get the highest build number first
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore 'PGRST116' (Row not found)
        throw fetchError
      }

      // --- 2. Determine the next build number and version ---
      const latestBuildNumber = latestBuildData ? latestBuildData.build_number : 0
      const latestVersion = latestBuildData ? latestBuildData.version : '1.0.0'
      const nextBuildNumber = latestBuildNumber + 1

      console.log(
        chalk.blue(
          `   Publishing (${scenarioKey}) build number ${chalk.bold(nextBuildNumber)} with version ${chalk.bold(latestVersion)}.`,
        ),
      )

      // --- 3. Prepare and Insert the new version ---
      // Map the input schema to the scenario table structure
      const rowToInsert = {
        key: scenarioKey,
        mainComponent: schema.mainComponent || schema.main || {},
        components: schema.components || {},
        stores: schema.stores || null,
        actions: schema.actions || null,
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

      // --- 4. Show Success Message ---
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
