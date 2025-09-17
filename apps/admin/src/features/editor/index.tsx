import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useEffect, useMemo, useRef, useState } from 'react'
import EditorComponent, { OnMount } from '@monaco-editor/react'

// --- minimal typings so Monaco knows React + your Render components ---
const reactShimDts = `
declare namespace React {
  type ReactNode = any;
  interface FC<P = {}> { (props: P): any }
}
`

const renderDts = `
// Types for your UI kit
declare namespace Render {
  interface ContainerProps { children?: React.ReactNode }
  interface LabelProps { children?: React.ReactNode }
  // add more components & props as you like:
  const Container: React.FC<ContainerProps>;
  const Label: React.FC<LabelProps>;
}
declare global {
  const Render: typeof Render; // global available at runtime in preview
}
export {};
`

// Starter code using <Render.*> with React
const STARTER = `
// Tip: autocompletion works for <Render.Container> and <Render.Label> props

function OrderItem() {
  return (
    <Render.Container>
      <Render.Label>Price:</Render.Label>
      {/* etc */}
    </Render.Container>
  );
}

function App() {
  return <OrderItem />;
}
`.trim()

export default function Editor() {
  const [code, setCode] = useState(STARTER)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

    // Inject typings so IntelliSense understands React + Render
    monaco.languages.typescript.typescriptDefaults.addExtraLib(reactShimDts, 'file:///react-shim.d.ts')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(renderDts, 'file:///render.d.ts')

    // Optional: snippet completion
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (_model, position) => ({
        suggestions: [
          {
            label: 'render:container',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `<Render.Container>\n  $0\n</Render.Container>`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Render.Container snippet',
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column,
            },
          },
        ],
      }),
    })
  }

  // Build a srcDoc with Babel transform and global Render + React
  const srcDoc = useMemo(() => {
    // NOTE: Replace CDN URLs if you self-host
    const reactCDN = 'https://unpkg.com/react@18/umd/react.development.js'
    const reactDomCDN = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js'
    const babelCDN = 'https://unpkg.com/@babel/standalone/babel.min.js'

    // A super-simple runtime shim for your Render lib (replace with your real components)
    const renderRuntime = `
      (function(){
        const e = React.createElement;
        const Render = {
          Container: ({children}) => e('div', {style:{padding:12,border:'1px solid #ddd',borderRadius:8}}, children),
          Label: ({children}) => e('span', {style:{fontWeight:'600',marginRight:8}}, children),
        };
        window.Render = Render;
      })();
    `

    const html = `
<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <div id="root"></div>
    <script src="${reactCDN}"></script>
    <script src="${reactDomCDN}"></script>
    <script>${renderRuntime}</script>
    <script src="${babelCDN}"></script>
    <script type="text/babel" data-presets="react,typescript">
      ${code}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
    </script>
  </body>
</html>
`.trim()

    return html
  }, [code])

  // Push new srcDoc on change (cheap, sandboxed)
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = srcDoc
    }
  }, [srcDoc])

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
            <h2 className='text-2xl font-bold tracking-tight'>Editor</h2>
            <p className='text-muted-foreground'>Code editor with live preview for React components</p>
          </div>
        </div>
        <div className='flex-1 overflow-auto px-4 py-1'>
          <div className='h-[calc(100vh-12rem)] flex'>
            <div className='w-1/2 border-r'>
              <EditorComponent
                height='100%'
                defaultLanguage='typescript'
                defaultValue={STARTER}
                onChange={(v) => setCode(v ?? '')}
                onMount={onMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
            <div className='w-1/2'>
              <iframe ref={iframeRef} title='Preview' sandbox='allow-scripts' className='h-full w-full bg-white' />
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}