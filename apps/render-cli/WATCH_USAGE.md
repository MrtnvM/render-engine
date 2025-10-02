# Watch Command Usage Guide

The `watch` command monitors TSX/JSX files for changes and automatically compiles and pushes them to Supabase.

## Prerequisites

1. Set up environment variables in `.env`:

   ```bash
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

2. Or pass them as command-line options.

## Basic Usage

```bash
# Watch a file using environment variables
render watch src/playground

# Watch a file with explicit credentials
render watch src/cart --supabase-url https://your-project.supabase.co --supabase-key your_key

# Watch with custom debounce (useful for slower systems or rapid edits)
render watch src/playground --debounce 500
```

## How It Works

1. **Initial Compilation**: When you start watching, the command performs an initial compile and push
2. **File Watching**: The command monitors the specified file for changes
3. **Debouncing**: Changes are debounced (default 300ms) to avoid excessive compilations during rapid edits
4. **Automatic Push**: On each change, the file is:
   - Compiled from TSX/JSX to JSON schema
   - Published to Supabase with an incremented build number
5. **Error Handling**: If compilation or push fails, the error is displayed but watching continues
6. **Graceful Shutdown**: Press Ctrl+C to stop watching

## Features

- ✨ **Automatic Detection**: Automatically finds `.tsx` or `.jsx` files
- 🔄 **Smart Debouncing**: Prevents excessive compilations during rapid edits
- 📊 **Build Versioning**: Automatically increments build numbers
- 🎯 **Error Recovery**: Continues watching even if a compilation fails
- 🚀 **Hot Reload**: Changes are immediately available after successful push

## Example Workflow

```bash
# Terminal 1: Start watching
cd /path/to/your/project
render watch src/playground

# Terminal 2: Make changes to your TSX file
vim src/playground.tsx
# Save the file, and the watcher will automatically compile and push

# Output in Terminal 1:
# [10:30:15] 🔄 Change detected, compiling and pushing...
# [10:30:15]    ✓ Compilation successful
# [10:30:15] ✅ Published successfully! (Build: 42, Version: 1.0.0)
```

## Tips

- **Debounce Timing**: If you're making many rapid changes, increase the debounce delay:

  ```bash
  render watch src/playground --debounce 1000
  ```

- **Multiple Files**: Run separate watch commands in different terminals for multiple files

- **Testing**: The watch command is perfect for development - make changes, save, and immediately see results in your app

## Troubleshooting

### "Could not find file"

Make sure you're providing the path without the extension:

```bash
# ❌ Wrong
render watch src/playground.tsx

# ✅ Correct
render watch src/playground
```

### "Supabase URL and Service Key are required"

Either set environment variables or pass them as options:

```bash
render watch src/playground --supabase-url YOUR_URL --supabase-key YOUR_KEY
```

### Changes not detected

- Check that your file path is correct
- Ensure you're saving the file properly
- Try increasing the debounce delay
