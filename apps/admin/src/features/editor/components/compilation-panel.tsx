import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { useCompileScenario } from '../hooks/use-compile-scenario'

interface CompilationPanelProps {
  jsxCode: string
  onCompilationSuccess?: (result: any) => void
}

export function CompilationPanel({ jsxCode, onCompilationSuccess }: CompilationPanelProps) {
  const compileMutation = useCompileScenario()
  const [compiledResult, setCompiledResult] = useState<any>(null)

  const handleCompile = () => {
    compileMutation.mutate(
      { jsxCode },
      {
        onSuccess: (data) => {
          setCompiledResult(data)
          onCompilationSuccess?.(data)
        },
      },
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Компиляция</h3>
        <Button onClick={handleCompile} disabled={compileMutation.isPending || !jsxCode.trim()}>
          {compileMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {compileMutation.isPending ? 'Компиляция...' : 'Скомпилировать JSX'}
        </Button>
      </div>

      {/* Compilation Errors */}
      {compileMutation.isError && (
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>
            <div className='font-semibold mb-2'>{compileMutation.error.error}</div>
            {compileMutation.error.errors && (
              <ul className='space-y-1 text-sm'>
                {compileMutation.error.errors.map((err, idx) => (
                  <li key={idx} className='flex items-start gap-2'>
                    <span className='font-mono text-xs bg-red-100 dark:bg-red-900 px-1 rounded'>{err.code}</span>
                    <span>{err.message}</span>
                    {err.line && <span className='text-xs opacity-70'>(line {err.line})</span>}
                  </li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Compilation Success */}
      {compileMutation.isSuccess && compiledResult && (
        <Card className='border-green-200 dark:border-green-800'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <CardTitle className='text-green-700 dark:text-green-400'>Компиляция успешна</CardTitle>
            </div>
            <CardDescription>
              Сценарий "{compiledResult.key}" v{compiledResult.version}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='font-semibold'>Ключ:</span> {compiledResult.key}
              </div>
              <div>
                <span className='font-semibold'>Версия:</span> {compiledResult.version}
              </div>
              <div>
                <span className='font-semibold'>Компоненты:</span> {Object.keys(compiledResult.components || {}).length}
              </div>
              {compiledResult.stores && (
                <div>
                  <span className='font-semibold'>Stores:</span> {compiledResult.stores.length}
                </div>
              )}
              {compiledResult.actions && (
                <div>
                  <span className='font-semibold'>Actions:</span> {compiledResult.actions.length}
                </div>
              )}
            </div>

            {/* JSON Preview */}
            <details className='mt-4'>
              <summary className='cursor-pointer text-sm font-semibold hover:text-blue-600'>
                Показать JSON схему
              </summary>
              <pre className='mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto max-h-96'>
                {JSON.stringify(compiledResult, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
