/**
 * UI Action APIs
 *
 * These functions provide a type-safe API for UI feedback actions.
 * At transpile time, they are analyzed and converted to declarative UI action descriptors.
 *
 * Note: These functions are markers for the transpiler and should NOT be called at runtime.
 */

export type ToastDuration = 'short' | 'long'
export type ToastPosition = 'top' | 'center' | 'bottom'

/**
 * Show a toast notification
 *
 * @example
 * ui.showToast('Item added to cart', { duration: 'short', position: 'bottom' })
 */
export function showToast(
  message: string,
  options?: {
    duration?: ToastDuration
    position?: ToastPosition
  },
): void {
  throw new Error('ui.showToast() is a transpiler marker and should not be called at runtime')
}

/**
 * Show an alert dialog
 *
 * @example
 * ui.showAlert('Delete Item?', {
 *   message: 'This action cannot be undone',
 *   actions: [
 *     { label: 'Cancel', style: 'cancel' },
 *     { label: 'Delete', style: 'destructive', onPress: deleteAction }
 *   ]
 * })
 */
export function showAlert(
  title: string,
  options?: {
    message?: string
    actions?: Array<{
      label: string
      style?: 'default' | 'cancel' | 'destructive'
      onPress?: any // ActionDescriptor
    }>
  },
): void {
  throw new Error('ui.showAlert() is a transpiler marker and should not be called at runtime')
}

/**
 * Show a bottom sheet
 *
 * @example
 * ui.showSheet('FilterOptions', { category: 'electronics' })
 */
export function showSheet(screenKey: string, params?: Record<string, any>): void {
  throw new Error('ui.showSheet() is a transpiler marker and should not be called at runtime')
}

/**
 * Dismiss the current bottom sheet
 *
 * @example
 * ui.dismissSheet()
 */
export function dismissSheet(): void {
  throw new Error('ui.dismissSheet() is a transpiler marker and should not be called at runtime')
}

/**
 * Show a loading indicator
 *
 * @example
 * ui.showLoading('Saving...')
 */
export function showLoading(message?: string): void {
  throw new Error('ui.showLoading() is a transpiler marker and should not be called at runtime')
}

/**
 * Hide the loading indicator
 *
 * @example
 * ui.hideLoading()
 */
export function hideLoading(): void {
  throw new Error('ui.hideLoading() is a transpiler marker and should not be called at runtime')
}

// Export as namespace
export const ui = {
  showToast,
  showAlert,
  showSheet,
  dismissSheet,
  showLoading,
  hideLoading,
}
