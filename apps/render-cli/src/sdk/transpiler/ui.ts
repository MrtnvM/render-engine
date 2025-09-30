import fs from 'fs'
import path from 'path'

// Function to get predefined component names directly from ui.tsx
export function getPredefinedComponents(): string[] {
  try {
    // Try different path strategies to find ui.tsx
    const possiblePaths = [
      path.resolve(process.cwd(), 'apps/render-cli/src/sdk/ui/ui.tsx'), // From workspace root
      path.resolve(process.cwd(), 'src/sdk/ui/ui.tsx'), // From project root
    ]

    let uiContent = ''
    for (const uiPath of possiblePaths) {
      try {
        uiContent = fs.readFileSync(uiPath, 'utf8')
        break
      } catch (e) {
        continue
      }
    }

    if (!uiContent) {
      const message = 'Could not read ui.tsx file, using fallback component list'
      console.error(message)
      throw new Error(message)
    }

    // Extract component names from export const statements
    const componentNames: string[] = []
    const exportRegex = /export const (\w+)/g
    let match

    while ((match = exportRegex.exec(uiContent)) !== null) {
      componentNames.push(match[1])
    }

    return componentNames
  } catch (error) {
    const message = 'Error reading ui.tsx file, using fallback component list'
    console.error(message)
    throw new Error(message)
  }
}
