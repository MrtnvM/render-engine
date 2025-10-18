/**
 * Predefined Action APIs
 *
 * This module exports all predefined action APIs that can be used in scenarios.
 * These APIs are transpiler markers - they are analyzed at compile time and converted
 * to declarative action descriptors that execute natively on mobile platforms.
 */

export { navigate, push, pop, replace, modal, dismissModal, popTo, reset } from './navigation.js'
export { ui, showToast, showAlert, showSheet, dismissSheet, showLoading, hideLoading } from './ui.js'
export {
  system,
  share,
  openUrl,
  haptic,
  copyToClipboard,
  requestCameraPermission,
  requestPhotoLibraryPermission,
  requestLocationPermission,
  requestNotificationPermission,
} from './system.js'

export type { ToastDuration, ToastPosition } from './ui.js'
export type { HapticStyle } from './system.js'
