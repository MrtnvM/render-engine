import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import EditorComponent, { OnMount } from '@monaco-editor/react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useScenarioRaw } from '@/features/tasks/hooks/use-scenarios'

// --- minimal typings so Monaco knows React + your Render components ---
const reactShimDts = `
declare namespace React {
  type ReactNode = any;
  interface FC<P = {}> { (props: P): any }
}
`

const renderDts = `
// Render UI Components Library
import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface LabelProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  htmlFor?: string;
}

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface InputProps {
  className?: string;
  style?: React.CSSProperties;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

interface SelectProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface OptionProps {
  children?: React.ReactNode;
  value: string;
  disabled?: boolean;
}

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Render namespace with all components
export namespace Render {
  const Container: React.FC<ContainerProps>;
  const Label: React.FC<LabelProps>;
  const Button: React.FC<ButtonProps>;
  const Input: React.FC<InputProps>;
  const Textarea: React.FC<TextareaProps>;
  const Select: React.FC<SelectProps>;
  const Option: React.FC<OptionProps>;
  const Card: React.FC<CardProps>;
  const CardHeader: React.FC<CardHeaderProps>;
  const CardContent: React.FC<CardContentProps>;
  const CardFooter: React.FC<CardFooterProps>;
}

// Also export components individually for direct import
export const Container: React.FC<ContainerProps>;
export const Label: React.FC<LabelProps>;
export const Button: React.FC<ButtonProps>;
export const Input: React.FC<InputProps>;
export const Textarea: React.FC<TextareaProps>;
export const Select: React.FC<SelectProps>;
export const Option: React.FC<OptionProps>;
export const Card: React.FC<CardProps>;
export const CardHeader: React.FC<CardHeaderProps>;
export const CardContent: React.FC<CardContentProps>;
export const CardFooter: React.FC<CardFooterProps>;

// Default export for easy importing
export default {
  Container,
  Label,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
};
`

// Starter code using <Render.*> with React
const STARTER = `
// Render components are available globally - start typing Render. to see all components

function UserProfile() {
  return (
    <Render.Card>
      <Render.CardHeader>
        <h3>User Profile</h3>
      </Render.CardHeader>
      <Render.CardContent>
        <Render.Container>
          <Render.Label>Name:</Render.Label>
          <Render.Input type="text" placeholder="Enter your name" />

          <Render.Label>Email:</Render.Label>
          <Render.Input type="email" placeholder="Enter your email" />

          <Render.Label>Bio:</Render.Label>
          <Render.Textarea placeholder="Tell us about yourself" rows={4} />

          <Render.Label>Role:</Render.Label>
          <Render.Select>
            <Render.Option value="user">User</Render.Option>
            <Render.Option value="admin">Admin</Render.Option>
          </Render.Select>
        </Render.Container>
      </Render.CardContent>
      <Render.CardFooter>
        <Render.Button variant="primary" onClick={() => alert('Saved!')}>
          Save Profile
        </Render.Button>
      </Render.CardFooter>
    </Render.Card>
  );
}

function App() {
  return <UserProfile />;
}
`.trim()

export default function Editor() {
  const search = useSearch({ from: '/_authenticated/editor' })
  const { data: scenarioData, isLoading, isError } = useScenarioRaw(search.scenarioId ?? null)

  // Generate initial code from scenario data or use starter
  const initialCode = useMemo(() => {
    if (scenarioData) {
      // Format scenario data as JSON with proper indentation
      const scenarioJson = {
        id: scenarioData.id,
        key: scenarioData.key,
        version: scenarioData.version,
        build_number: scenarioData.build_number,
        mainComponent: scenarioData.mainComponent,
        components: scenarioData.components,
        metadata: scenarioData.metadata,
      }
      return JSON.stringify(scenarioJson, null, 2)
    }
    return STARTER
  }, [scenarioData])

  const [code, setCode] = useState(initialCode)

  // Update code when scenario data loads
  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const onMount: OnMount = (_editor, monaco) => {
    // TS config for JSX/TS
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React, // classic runtime
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowJs: true,
      checkJs: false,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
    })

    // Create global Render declaration that works with TypeScript
    const globalRenderDts = `
      // Global Render declaration for runtime
      declare global {
        interface ContainerProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }
        interface LabelProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
          htmlFor?: string;
        }
        interface ButtonProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
          variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
          size?: 'sm' | 'md' | 'lg';
          disabled?: boolean;
          onClick?: () => void;
          type?: 'button' | 'submit' | 'reset';
        }
        interface InputProps {
          className?: string;
          style?: React.CSSProperties;
          type?: 'text' | 'email' | 'password' | 'number' | 'tel';
          placeholder?: string;
          value?: string;
          disabled?: boolean;
          readOnly?: boolean;
          onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        }
        interface TextareaProps {
          className?: string;
          style?: React.CSSProperties;
          placeholder?: string;
          value?: string;
          disabled?: boolean;
          readOnly?: boolean;
          onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
          rows?: number;
        }
        interface SelectProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
          value?: string;
          disabled?: boolean;
          onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        }
        interface OptionProps {
          children?: React.ReactNode;
          value: string;
          disabled?: boolean;
        }
        interface CardProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }
        interface CardHeaderProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }
        interface CardContentProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }
        interface CardFooterProps {
          children?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }

        namespace Render {
          const Container: React.FC<ContainerProps>;
          const Label: React.FC<LabelProps>;
          const Button: React.FC<ButtonProps>;
          const Input: React.FC<InputProps>;
          const Textarea: React.FC<TextareaProps>;
          const Select: React.FC<SelectProps>;
          const Option: React.FC<OptionProps>;
          const Card: React.FC<CardProps>;
          const CardHeader: React.FC<CardHeaderProps>;
          const CardContent: React.FC<CardContentProps>;
          const CardFooter: React.FC<CardFooterProps>;
        }

        const Render: typeof Render;
      }

      export {};
    `

    // Configure diagnostics options to be less strict for better experience
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    })

    // Inject typings so IntelliSense understands React + Render
    monaco.languages.typescript.typescriptDefaults.addExtraLib(reactShimDts, 'file:///react-shim.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(globalRenderDts, 'file:///global-render.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(renderDts, 'file:///render.d.ts')

    // Enhanced completion provider for Render namespace
    monaco.languages.registerCompletionItemProvider('typescript', {
      triggerCharacters: ['.'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // More flexible matching for "Render." - handle whitespace and different contexts
        const renderMatch = textUntilPosition.match(/\bRender\s*\.$/)

        if (renderMatch) {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          }

          const suggestions = [
            {
              label: 'Container',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Container',
              documentation: 'Container component for layout and grouping elements',
              detail: 'React.FC<ContainerProps>',
              range,
            },
            {
              label: 'Label',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Label',
              documentation: 'Label component for form field labels',
              detail: 'React.FC<LabelProps>',
              range,
            },
            {
              label: 'Button',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Button',
              documentation: 'Button component with multiple variants (primary, secondary, outline, ghost)',
              detail: 'React.FC<ButtonProps>',
              range,
            },
            {
              label: 'Input',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Input',
              documentation: 'Input component for text, email, password, and other input types',
              detail: 'React.FC<InputProps>',
              range,
            },
            {
              label: 'Textarea',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Textarea',
              documentation: 'Textarea component for multi-line text input',
              detail: 'React.FC<TextareaProps>',
              range,
            },
            {
              label: 'Select',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Select',
              documentation: 'Select component for dropdown menus',
              detail: 'React.FC<SelectProps>',
              range,
            },
            {
              label: 'Option',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Option',
              documentation: 'Option component for select dropdown options',
              detail: 'React.FC<OptionProps>',
              range,
            },
            {
              label: 'Card',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'Card',
              documentation: 'Card component for content containers with shadow and border',
              detail: 'React.FC<CardProps>',
              range,
            },
            {
              label: 'CardHeader',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'CardHeader',
              documentation: 'CardHeader component for card headers with bottom border',
              detail: 'React.FC<CardHeaderProps>',
              range,
            },
            {
              label: 'CardContent',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'CardContent',
              documentation: 'CardContent component for main card content area',
              detail: 'React.FC<CardContentProps>',
              range,
            },
            {
              label: 'CardFooter',
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: 'CardFooter',
              documentation: 'CardFooter component for card footers with top border',
              detail: 'React.FC<CardFooterProps>',
              range,
            },
          ]

          return { suggestions }
        }

        return { suggestions: [] }
      },
    })

    // Enhanced autocompletion snippets for Render components (lower priority)
    monaco.languages.registerCompletionItemProvider('typescript', {
      triggerCharacters: [':', 'r'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        })

        // Only provide snippets if not already in a Render. completion context
        if (textUntilPosition.match(/\bRender\s*\.$/)) {
          return { suggestions: [] }
        }

        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        return {
          suggestions: [
            // Container snippets
            {
              label: 'render:container',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `<Render.Container>\n  $0\n</Render.Container>`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Container snippet',
              range,
            },
            // Label snippets
            {
              label: 'render:label',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<Render.Label>${1:Label Text}</Render.Label>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Label snippet',
              range,
            },
            // Button snippets
            {
              label: 'render:button',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                '<Render.Button variant="${1|primary,secondary,outline,ghost|}" onClick={() => ${2:console.log(\'clicked\')}}>${3:Button Text}</Render.Button>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Button snippet',
              range,
            },
            // Input snippets
            {
              label: 'render:input',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                '<Render.Input type="${1|text,email,password,number,tel|}" placeholder="${2:Enter text}" onChange={(e) => ${3:console.log(e.target.value)}} />',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Input snippet',
              range,
            },
            // Textarea snippets
            {
              label: 'render:textarea',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                '<Render.Textarea placeholder="${1:Enter text}" rows={${2:4}} onChange={(e) => ${3:console.log(e.target.value)}} />',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Textarea snippet',
              range,
            },
            // Select snippets
            {
              label: 'render:select',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                '<Render.Select onChange={(e) => ${1:console.log(e.target.value)}}>\\n  <Render.Option value="${2:option1}">${3:Option 1}</Render.Option>\\n  <Render.Option value="${4:option2}">${5:Option 2}</Render.Option>\\n</Render.Select>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Select snippet',
              range,
            },
            // Card snippets
            {
              label: 'render:card',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                '<Render.Card>\\n  <Render.CardHeader>\\n    <h3>${1:Card Title}</h3>\\n  </Render.CardHeader>\\n  <Render.CardContent>\\n    $0\\n  </Render.CardContent>\\n  <Render.CardFooter>\\n    ${2:}\\n  </Render.CardFooter>\\n</Render.Card>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Render.Card snippet',
              range,
            },
            // Function component snippet
            {
              label: 'render:function',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                'function ${1:ComponentName}() {\\n  return (\\n    <Render.Container>\\n      $0\\n    </Render.Container>\\n  );\\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'React function component with Render',
              range,
            },
          ],
        }
      },
    })
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Render Engine - Редактор</h2>
            <p className='text-muted-foreground'>
              {scenarioData
                ? `Редактирование сценария: ${scenarioData.key} (v${scenarioData.version})`
                : 'Редактор кода для создания и редактирования сценариев'}
            </p>
          </div>
        </div>
        <div className='flex-1 overflow-auto px-4 py-1'>
          {isLoading ? (
            <div className='flex h-[calc(100vh-12rem)] items-center justify-center'>
              <p className='text-muted-foreground'>Загрузка сценария...</p>
            </div>
          ) : isError && search.scenarioId ? (
            <div className='flex h-[calc(100vh-12rem)] items-center justify-center'>
              <p className='text-red-500'>Ошибка загрузки сценария. Проверьте подключение к базе данных.</p>
            </div>
          ) : (
            <div className='h-[calc(100vh-12rem)]'>
              <EditorComponent
                height='100%'
                defaultLanguage={scenarioData ? 'json' : 'typescript'}
                value={code}
                onChange={(v) => setCode(v ?? '')}
                onMount={onMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 2,
                  readOnly: !!scenarioData, // Make read-only when viewing scenario
                }}
              />
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
