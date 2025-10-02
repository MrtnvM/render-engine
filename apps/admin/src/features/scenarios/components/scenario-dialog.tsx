import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Code, 
  Eye, 
  Save, 
  Upload,
  AlertTriangle
} from 'lucide-react'
import { scenarioService } from '../api/scenarios'
import type { Scenario, CompileResult, ValidationResult } from '../types'

interface ScenarioDialogProps {
  mode: 'create' | 'edit' | null
  scenario?: Scenario | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DEFAULT_JSX = `export const SCENARIO_KEY = 'my-scenario'

export default function MyScenario() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>This is a sample scenario.</p>
    </div>
  )
}`

export function ScenarioDialog({ 
  mode, 
  scenario, 
  open, 
  onOpenChange, 
  onSuccess 
}: ScenarioDialogProps) {
  const [key, setKey] = useState('')
  const [jsxCode, setJsxCode] = useState(DEFAULT_JSX)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [compiled, setCompiled] = useState<CompileResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')

  // Initialize form when dialog opens
  useEffect(() => {
    if (mode === 'edit' && scenario) {
      setKey(scenario.key)
      setJsxCode(scenario.metadata?.jsxCode || DEFAULT_JSX)
    } else if (mode === 'create') {
      setKey('')
      setJsxCode(DEFAULT_JSX)
    }
    
    // Reset state
    setValidation(null)
    setCompiled(null)
    setActiveTab('editor')
  }, [mode, scenario, open])

  const handleValidate = async () => {
    if (!jsxCode.trim()) return

    setIsValidating(true)
    try {
      const result = await scenarioService.validate(jsxCode)
      setValidation(result)
      if (result.valid) {
        setActiveTab('preview')
      }
    } catch (error) {
      setValidation({
        valid: false,
        message: 'Validation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleCompile = async () => {
    if (!jsxCode.trim()) return

    setIsCompiling(true)
    try {
      const result = await scenarioService.compile(jsxCode)
      setCompiled(result)
      setValidation({ valid: true, message: 'JSX compiled successfully' })
      setActiveTab('preview')
    } catch (error) {
      setValidation({
        valid: false,
        message: 'Compilation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setCompiled(null)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleSave = async () => {
    if (!jsxCode.trim()) return
    if (mode === 'create' && !key.trim()) return

    setIsSaving(true)
    try {
      if (mode === 'create') {
        await scenarioService.create({
          key: key.trim(),
          jsxCode,
          metadata: { description: 'Created via admin panel' }
        })
      } else if (mode === 'edit' && scenario) {
        await scenarioService.update(scenario.key, {
          jsxCode,
          metadata: { 
            ...scenario.metadata,
            jsxCode,
            description: 'Updated via admin panel'
          }
        })
      }
      
      onSuccess()
    } catch (error) {
      console.error('Failed to save scenario:', error)
      // TODO: Show error toast
    } finally {
      setIsSaving(false)
    }
  }

  const isValid = validation?.valid === true
  const canSave = jsxCode.trim() && (mode === 'edit' || key.trim()) && isValid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Scenario' : 'Edit Scenario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Write JSX code and compile it to a JSON schema.'
              : 'Modify the JSX code and update the scenario.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 overflow-y-auto'>
          {mode === 'create' && (
            <div className='space-y-2'>
              <Label htmlFor='scenario-key'>Scenario Key</Label>
              <Input
                id='scenario-key'
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder='my-awesome-scenario'
                className='font-mono'
              />
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='editor'>
                <Code className='w-4 h-4 mr-2' />
                JSX Editor
              </TabsTrigger>
              <TabsTrigger value='preview'>
                <Eye className='w-4 h-4 mr-2' />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value='editor' className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='jsx-code'>JSX Code</Label>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleValidate}
                      disabled={isValidating || !jsxCode.trim()}
                    >
                      {isValidating ? (
                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                      ) : (
                        <CheckCircle className='w-3 h-3 mr-1' />
                      )}
                      Validate
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCompile}
                      disabled={isCompiling || !jsxCode.trim()}
                    >
                      {isCompiling ? (
                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                      ) : (
                        <Upload className='w-3 h-3 mr-1' />
                      )}
                      Compile
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  id='jsx-code'
                  value={jsxCode}
                  onChange={(e) => setJsxCode(e.target.value)}
                  className='font-mono text-sm min-h-[400px] resize-none'
                  placeholder={DEFAULT_JSX}
                />

                {validation && (
                  <div className={`flex items-start gap-2 p-3 rounded-md ${
                    validation.valid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {validation.valid ? (
                      <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                    ) : (
                      <XCircle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
                    )}
                    <div className='space-y-1'>
                      <p className={`text-sm font-medium ${
                        validation.valid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validation.message}
                      </p>
                      {validation.error && (
                        <p className='text-xs text-red-600 font-mono'>
                          {validation.error}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value='preview' className='space-y-4'>
              {compiled ? (
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold'>Compiled Schema</h3>
                    <Badge variant='success'>{compiled.key}</Badge>
                    <Badge variant='outline'>v{compiled.version}</Badge>
                  </div>

                  <div className='grid gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-sm'>Main Component</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className='text-xs bg-muted p-3 rounded-md overflow-auto max-h-48'>
                          {JSON.stringify(compiled.main, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>

                    {Object.keys(compiled.components).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-sm'>
                            Components ({Object.keys(compiled.components).length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className='text-xs bg-muted p-3 rounded-md overflow-auto max-h-48'>
                            {JSON.stringify(compiled.components, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <AlertTriangle className='w-12 h-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold'>No Preview Available</h3>
                  <p className='text-muted-foreground mb-4'>
                    Compile your JSX code to see the generated JSON schema.
                  </p>
                  <Button onClick={handleCompile} disabled={isCompiling || !jsxCode.trim()}>
                    {isCompiling ? (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    ) : (
                      <Upload className='w-4 h-4 mr-2' />
                    )}
                    Compile JSX
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!canSave || isSaving}
            >
              {isSaving ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Save className='w-4 h-4 mr-2' />
              )}
              {mode === 'create' ? 'Create' : 'Save'} Scenario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}