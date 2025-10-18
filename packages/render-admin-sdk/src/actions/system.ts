/**
 * System Action APIs
 *
 * These functions provide a type-safe API for system-level actions.
 * At transpile time, they are analyzed and converted to declarative system action descriptors.
 *
 * Note: These functions are markers for the transpiler and should NOT be called at runtime.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

/**
 * Share content using native share sheet
 *
 * @example
 * share({ text: 'Check out this app!', url: 'https://example.com' })
 */
export function share(content: {
  text?: string
  url?: string
  title?: string
  subject?: string
}): void {
  throw new Error('share() is a transpiler marker and should not be called at runtime')
}

/**
 * Open a URL in the default browser or appropriate app
 *
 * @example
 * openUrl('https://example.com')
 * openUrl('mailto:support@example.com')
 * openUrl('tel:+1234567890')
 */
export function openUrl(url: string): void {
  throw new Error('openUrl() is a transpiler marker and should not be called at runtime')
}

/**
 * Trigger haptic feedback
 *
 * @example
 * haptic('success')
 * haptic('light')
 */
export function haptic(style: HapticStyle): void {
  throw new Error('haptic() is a transpiler marker and should not be called at runtime')
}

/**
 * Copy text to clipboard
 *
 * @example
 * copyToClipboard('Product link copied!')
 */
export function copyToClipboard(text: string): void {
  throw new Error('copyToClipboard() is a transpiler marker and should not be called at runtime')
}

/**
 * Request camera permission
 *
 * @example
 * requestCameraPermission()
 */
export function requestCameraPermission(): void {
  throw new Error('requestCameraPermission() is a transpiler marker and should not be called at runtime')
}

/**
 * Request photo library permission
 *
 * @example
 * requestPhotoLibraryPermission()
 */
export function requestPhotoLibraryPermission(): void {
  throw new Error('requestPhotoLibraryPermission() is a transpiler marker and should not be called at runtime')
}

/**
 * Request location permission
 *
 * @example
 * requestLocationPermission()
 */
export function requestLocationPermission(): void {
  throw new Error('requestLocationPermission() is a transpiler marker and should not be called at runtime')
}

/**
 * Request notification permission
 *
 * @example
 * requestNotificationPermission()
 */
export function requestNotificationPermission(): void {
  throw new Error('requestNotificationPermission() is a transpiler marker and should not be called at runtime')
}

// Export as namespace
export const system = {
  share,
  openUrl,
  haptic,
  copyToClipboard,
  requestCameraPermission,
  requestPhotoLibraryPermission,
  requestLocationPermission,
  requestNotificationPermission,
}
