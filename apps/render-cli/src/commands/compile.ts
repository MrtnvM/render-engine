import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { transpile } from '@render-engine/admin-sdk'

export const compileCommand = program
  .command('compile')
  .description('Compile a React DSL file to a Render JSON schema.')
  .argument('<inputFile>', 'Path to the input React DSL file (.tsx or .jsx)')
  .option(
    '-o, --output <outputFile>',
    'Path to the output JSON file. Defaults to the same name as the input file with a .json extension.',
  )
  .action(async (inputFile, options) => {
    // --- 1. Resolve File Paths ---
    const inputPath = path.resolve(process.cwd(), inputFile)

    // Determine the output path. If not provided, create it from the input path.
    const outputPath = options.output
      ? path.resolve(process.cwd(), options.output)
      : inputPath.replace(/\.(tsx|jsx)$/, '.json')

    console.log(chalk.blue(`Compiling: ${chalk.bold(inputPath)}`))
    console.log(chalk.blue(`Output to: ${chalk.bold(outputPath)}`))
    console.log('---')

    try {
      // --- 2. Read the Input File ---
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found at: ${inputPath}`)
      }
      const jsxString = fs.readFileSync(inputPath, 'utf8')

      // --- 3. Transpile the Code ---
      const jsonSchema = await transpile(jsxString)

      // --- 4. Write the Output File ---
      // Pretty-print the JSON with an indentation of 2 spaces
      const jsonOutput = JSON.stringify(jsonSchema, null, 2)
      fs.writeFileSync(outputPath, jsonOutput, 'utf8')

      // --- 5. Show Success Message ---
      console.log(chalk.green.bold('✅ Compilation successful!'))
      console.log(chalk.gray(`   Schema saved to: ${outputPath}`))
    } catch (error: any) {
      // --- 6. Handle Errors Gracefully ---
      console.error(chalk.red.bold('❌ Compilation failed.'))
      console.error(chalk.red(`\nError: ${error.message}`))

      // Exit with a non-zero code to indicate failure, which is important for scripting
      process.exit(1)
    }
  })
