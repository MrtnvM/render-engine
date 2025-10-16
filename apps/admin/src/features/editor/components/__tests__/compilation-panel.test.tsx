import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompilationPanel } from '../compilation-panel'

// Mock the hook
vi.mock('../../hooks/use-compile-scenario', () => ({
  useCompileScenario: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  }),
}))

describe('CompilationPanel', () => {
  const queryClient = new QueryClient()

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should render compile button', () => {
    render(<CompilationPanel jsxCode="test code" />, { wrapper })

    expect(screen.getByText(/Скомпилировать JSX/i)).toBeInTheDocument()
  })

  it('should disable button when JSX code is empty', () => {
    render(<CompilationPanel jsxCode="" />, { wrapper })

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should enable button when JSX code is provided', () => {
    render(<CompilationPanel jsxCode="export default function Main() {}" />, { wrapper })

    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should show loading state during compilation', () => {
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isSuccess: false,
      isError: false,
    })

    render(<CompilationPanel jsxCode="test code" />, { wrapper })

    expect(screen.getByText(/Компиляция\.\.\./i)).toBeInTheDocument()
  })

  it('should display compilation success message', () => {
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    const mockResult = {
      key: 'test-scenario',
      version: '1.0.0',
      main: { type: 'View' },
      components: { Button: { type: 'Button' } },
    }

    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      isError: false,
      data: mockResult,
    })

    render(<CompilationPanel jsxCode="test code" />, { wrapper })

    expect(screen.getByText(/Компиляция успешна/i)).toBeInTheDocument()
    expect(screen.getByText(/test-scenario/i)).toBeInTheDocument()
    expect(screen.getByText(/1.0.0/i)).toBeInTheDocument()
  })

  it('should display compilation errors', () => {
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: true,
      error: {
        error: 'Compilation failed',
        errors: [
          { code: 'SYNTAX_ERROR', message: 'Invalid JSX syntax', severity: 'error' },
        ],
      },
    })

    render(<CompilationPanel jsxCode="invalid code" />, { wrapper })

    expect(screen.getByText(/Compilation failed/i)).toBeInTheDocument()
    expect(screen.getByText(/Invalid JSX syntax/i)).toBeInTheDocument()
  })

  it('should call onCompilationSuccess callback', async () => {
    const onSuccess = vi.fn()
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    const mockMutate = vi.fn((_, options) => {
      options.onSuccess({ key: 'test', version: '1.0.0', main: {}, components: {} })
    })

    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
    })

    render(<CompilationPanel jsxCode="test code" onCompilationSuccess={onSuccess} />, { wrapper })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        key: 'test',
        version: '1.0.0',
        main: {},
        components: {},
      })
    })
  })

  it('should show component count in success message', () => {
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      isError: false,
      data: {
        key: 'test',
        version: '1.0.0',
        main: {},
        components: { Button: {}, Input: {}, Card: {} },
      },
    })

    render(<CompilationPanel jsxCode="test" />, { wrapper })

    expect(screen.getByText(/Компоненты:/i)).toBeInTheDocument()
    expect(screen.getByText(/3/i)).toBeInTheDocument()
  })

  it('should show stores and actions if present', () => {
    const { useCompileScenario } = require('../../hooks/use-compile-scenario')
    vi.mocked(useCompileScenario).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      isError: false,
      data: {
        key: 'test',
        version: '1.0.0',
        main: {},
        components: {},
        stores: [{ name: 'store1' }, { name: 'store2' }],
        actions: [{ name: 'action1' }],
      },
    })

    render(<CompilationPanel jsxCode="test" />, { wrapper })

    expect(screen.getByText(/Stores:/i)).toBeInTheDocument()
    expect(screen.getByText(/2/i)).toBeInTheDocument()
    expect(screen.getByText(/Actions:/i)).toBeInTheDocument()
    expect(screen.getByText(/1/i)).toBeInTheDocument()
  })
})
