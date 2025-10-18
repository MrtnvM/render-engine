/**
 * Component Registry Plugin
 *
 * Auto-discovers available UI components from ui.tsx file.
 * This provides a single source of truth for valid component names.
 */

import { readFileSync } from 'fs'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Handle both CommonJS and ESM imports
const traverse = (_traverse as any).default || _traverse

let cachedComponents: string[] | null = null

/**
 * Extract component names from ui.tsx by parsing exported const declarations
 */
function extractComponentsFromUIFile(): string[] {
  if (cachedComponents) {
    return cachedComponents
  }

  try {
    // Get the path to ui.tsx (need to handle both src and dist paths)
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    // Try src path first (for development), then dist path
    let uiFilePath = join(__dirname, '../../ui/ui.tsx')

    // If running from dist, adjust path to source
    if (__dirname.includes('/dist/')) {
      // Go up from dist/transpiler/plugins to packages/render-admin-sdk/src/ui/ui.tsx
      const packageRoot = __dirname.split('/dist/')[0]
      uiFilePath = join(packageRoot, 'src/ui/ui.tsx')
    }

    // Read and parse ui.tsx
    const uiFileContent = readFileSync(uiFilePath, 'utf-8')
    const ast = parse(uiFileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const components: string[] = []

    // Traverse AST to find exported const declarations (component definitions)
    traverse(ast, {
      ExportNamedDeclaration(path: any) {
        const declaration = path.node.declaration

        // Look for: export const ComponentName = ...
        if (declaration?.type === 'VariableDeclaration') {
          declaration.declarations.forEach((declarator: any) => {
            if (declarator.id.type === 'Identifier') {
              const componentName = declarator.id.name

              // Filter out non-component exports (interfaces, types, etc.)
              // Component names start with uppercase
              if (/^[A-Z]/.test(componentName)) {
                components.push(componentName)
              }
            }
          })
        }
      },
    })

    cachedComponents = components
    return components
  } catch (error) {
    // Fallback to empty array if ui.tsx cannot be read
    console.warn('Failed to extract components from ui.tsx:', error)
    return []
  }
}

/**
 * Get all available UI component names from ui.tsx
 * @returns Array of component names
 */
export function getAvailableComponents(): string[] {
  return extractComponentsFromUIFile()
}

/**
 * Check if a component name is valid (exists in ui.tsx)
 * @param componentName The component name to validate
 * @returns true if the component exists, false otherwise
 */
export function isValidComponent(componentName: string): boolean {
  const components = getAvailableComponents()
  return components.includes(componentName)
}

/**
 * Clear the component cache (useful for testing)
 */
export function clearComponentCache(): void {
  cachedComponents = null
}
