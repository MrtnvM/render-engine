# Render CLI

A command-line interface for the Render Engine, built with Node.js and Commander.js.

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Usage

```bash
# Show help
render-cli --help

# Initialize a new project
render-cli init

# Render content
render-cli render input.txt --output result.html

# Build templates
render-cli build --watch

# Show version
render-cli --version
```

## Commands

### `compile`

Compile a React DSL file to a Render JSON schema.

```bash
render compile <inputFile> [options]
```

**Arguments:**

- `inputFile` - Path to the input React DSL file (.tsx or .jsx)

**Options:**

- `-o, --output <outputFile>` - Path to the output JSON file (defaults to same name with .json extension)

### `push`

Compile and publish a React DSL file to Supabase.

```bash
render push <filePath> [options]
```

**Arguments:**

- `filePath` - Path to the input file without extension (e.g., "src/cart")

**Options:**

- `--supabase-url <url>` - Supabase project URL (overrides SUPABASE_URL env var)
- `--supabase-key <key>` - Supabase service role key (overrides SUPABASE_SERVICE_KEY env var)

### `watch`

Watch a React DSL file for changes and automatically compile and publish to Supabase.

```bash
render watch <filePath> [options]
```

**Arguments:**

- `filePath` - Path to the input file without extension (e.g., "src/cart")

**Options:**

- `--supabase-url <url>` - Supabase project URL (overrides SUPABASE_URL env var)
- `--supabase-key <key>` - Supabase service role key (overrides SUPABASE_SERVICE_KEY env var)
- `--debounce <ms>` - Debounce delay in milliseconds (default: 300)

**Example:**

```bash
# Watch a file and automatically push changes
render watch src/playground

# Watch with custom debounce
render watch src/playground --debounce 500
```

## Development

```bash
# Run in development mode
pnpm dev

# Run specific command in development
pnpm dev render --help

# Build for production
pnpm build

# Start the built CLI
pnpm start
```

## Features

- 🎨 Beautiful CLI interface with colors and spinners
- 📝 Interactive prompts for project initialization
- 🔄 Watch mode for development
- 📊 Verbose logging and error handling
- 🏗️ TypeScript support with full type safety
- 📦 ES modules support
