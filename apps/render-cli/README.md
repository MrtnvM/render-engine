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

### `init`

Initialize a new Render Engine project with interactive prompts or default values.

```bash
render-cli init [options]
```

**Options:**

- `-d, --dir <directory>` - Project directory (default: current directory)
- `-y, --yes` - Skip prompts and use defaults

### `render`

Render content using the Render Engine.

```bash
render-cli render [input] [options]
```

**Arguments:**

- `input` - Input file or content to render

**Options:**

- `-o, --output <path>` - Output file path
- `-t, --template <template>` - Template to use for rendering
- `-v, --verbose` - Enable verbose output

### `build`

Build and optimize render templates.

```bash
render-cli build [options]
```

**Options:**

- `-i, --input <path>` - Input directory or file (default: ./src)
- `-o, --output <path>` - Output directory (default: ./dist)
- `-w, --watch` - Watch for changes and rebuild
- `-m, --minify` - Minify output
- `--sourcemap` - Generate source maps

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
