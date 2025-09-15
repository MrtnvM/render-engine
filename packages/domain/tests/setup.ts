import 'reflect-metadata'

// Mock console methods to suppress debug output during tests
export const originalConsole = {
  log: console.log,
  warn: console.warn,
  debug: console.debug,
  info: console.info,
}

export function mockConsole() {
  console.log = () => {}
  console.warn = () => {}
  console.debug = () => {}
  console.info = () => {}
}

export function restoreConsole() {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.debug = originalConsole.debug
  console.info = originalConsole.info
}

mockConsole()
