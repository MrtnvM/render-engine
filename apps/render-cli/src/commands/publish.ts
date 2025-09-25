import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'

export const publishCommand = program
  .command('publish')
  .description('Publish a new version of a JSON schema to Supabase.')
  .argument('<inputFile>', 'Path to the input JSON schema file.')
  .option('--supabase-url <url>', 'Supabase project URL. Overrides SUPABASE_URL env var.')
  .option('--supabase-key <key>', 'Supabase service role key. Overrides SUPABASE_SERVICE_KEY env var.')
  .action(async (inputFile, options) => {
    console.log(chalk.cyan.bold('🚀 Starting schema publication...'))

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
      if (!schema.id) throw new Error('The input JSON must have a top-level "id" field.')

      console.log(chalk.blue(`   Schema ID: ${chalk.bold(schema.id)}`))

      const supabase = createClient(supabaseUrl, supabaseKey)

      // --- 1. Fetch the latest version for this ID ---
      console.log(chalk.yellow('   Checking for the latest version...'))

      const { data: latestVersionData, error: fetchError } = await supabase
        .from('schema_table')
        .select('version')
        .eq('id', schema.id)
        .order('version', { ascending: false }) // Important: get the highest version first
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore 'PGRST116' (Row not found)
        throw fetchError
      }

      // --- 2. Determine the next version number ---
      const latestVersion = latestVersionData ? latestVersionData.version : 0
      const nextVersion = latestVersion + 1

      console.log(
        chalk.blue(
          `   Latest version is ${chalk.bold(latestVersion)}. Publishing new version ${chalk.bold(nextVersion)}.`,
        ),
      )

      // --- 3. Prepare and Insert the new version ---
      // Ensure the content we store has the correct, database-assigned version.
      const contentToStore = {
        ...schema,
        buildNumber: nextVersion,
      }

      const rowToInsert = {
        id: schema.id,
        version: nextVersion,
        schema: contentToStore,
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('schema_table')
        .insert(rowToInsert)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // --- 4. Show Success Message ---
      console.log(chalk.green.bold('\n✅ Schema published successfully!'))
      console.log(chalk.gray(`   Record created for ID: ${insertedData.id}, Version: ${insertedData.version}`))
      console.log(chalk.gray(`   Published at: ${new Date(insertedData.created_at || new Date()).toLocaleString()}`))
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Publication failed.'))
      console.error(chalk.red(`   Error: ${error.message}`))
      process.exit(1)
    }
  })
