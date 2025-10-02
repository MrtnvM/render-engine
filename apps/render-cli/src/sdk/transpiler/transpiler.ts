/**
 * Legacy transpiler entry point - now uses the refactored system
 * Maintains backward compatibility while leveraging new architecture
 */

// Re-export from the new index file for backward compatibility
export { transpile as default, transpile } from './index.js'

// Re-export types for backward compatibility
export type { TranspiledScenario, JsonNode } from './types.js'
