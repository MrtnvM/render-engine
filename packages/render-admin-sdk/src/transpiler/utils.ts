/**
 * Default predefined component names
 * These are extracted from the UI component definitions
 */
export const DEFAULT_COMPONENTS = [
  'View',
  'Row',
  'Column',
  'Stack',
  'Text',
  'Image',
  'Button',
  'Checkbox',
  'Spacer',
  'SafeAreaView',
]

/**
 * Get predefined component names
 * @param customComponents Optional list of custom component names to include
 * @returns Array of component names
 */
export function getPredefinedComponents(customComponents?: string[]): string[] {
  return customComponents ? [...DEFAULT_COMPONENTS, ...customComponents] : DEFAULT_COMPONENTS
}
