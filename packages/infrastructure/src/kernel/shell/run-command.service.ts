import { execa } from 'execa'
import { logger } from '@render-engine/domain'

export interface RunCommandOptions {
  cwd?: string
  stdio?: 'inherit' | 'pipe' | 'ignore'
  timeout?: number
}

export interface RunCommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

export class RunCommandService {
  private readonly logger = logger(RunCommandService)

  async runCommand(command: string, args: string[] = [], options: RunCommandOptions = {}): Promise<RunCommandResult> {
    const { cwd = process.cwd(), stdio = 'inherit', timeout = 30000 } = options

    this.logger.debug('Running command', {
      command,
      args,
      cwd,
      stdio,
      timeout,
    })

    try {
      const result = await execa(command, args, {
        cwd,
        stdio,
        timeout,
      })

      this.logger.debug('Command completed successfully', {
        command,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      })

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0,
      }
    } catch (error: any) {
      this.logger.error('Command failed', {
        command,
        args,
        cwd,
        error: error.message,
        exitCode: error.exitCode,
        stdout: error.stdout,
        stderr: error.stderr,
      })

      // Re-throw with more context
      const enhancedError = new Error(`Command failed: ${command} ${args.join(' ')}`)
      enhancedError.cause = error
      throw enhancedError
    }
  }
}

// Convenience function for backward compatibility
export async function runCommand(
  command: string,
  args: string[] = [],
  options: RunCommandOptions = {},
): Promise<RunCommandResult> {
  const service = new RunCommandService()
  return service.runCommand(command, args, options)
}
