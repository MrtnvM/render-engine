import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import EditorComponent, { OnMount } from '@monaco-editor/react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useScenarioRaw } from '@/features/tasks/hooks/use-scenarios'
import { CompilationPanel } from './components/compilation-panel'
import { PublishDialog } from './components/publish-dialog'

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
import { Column, Row, Text, Image, Button, Checkbox, Stepper, Rating, View } from '@render-engine/admin-sdk/ui'

export const SCENARIO_KEY = 'avito-cart'

export default function CartScreen() {
  return (
    <Column style={{ flexGrow: 1, backgroundColor: '#ffffff' }}>
      <Column style={{ flexGrow: 1 }}>
        <TopRow />
        <SellerSection storeName="Pear Store" rating="4.8" reviewCount="643" checked={false} />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/magsafe.png"
          price="4 990 ₽"
          title="ЗарядкаMagSafe Charger 15W 1 метр"
          quantity={1}
          checked={true}
        />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/airpods.png"
          price="15 990 ₽"
          title="AirPods Pro 2"
          quantity={1}
          checked={true}
        />
        <CartItem
          image="https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/watch2.png"
          price="26 591 ₽"
          title="Apple Watch 10 42mm Blue"
          quantity={1}
          checked={true}
        />
      </Column>
      <BottomBar />
    </Column>
  )
}

function TopRow() {
  return (
    <Row
      style={{
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Checkbox
        style={{
          borderColor: '#0099F7',
          borderRadius: 4,
          marginRight: 16,
        }}
        properties={{ checked: true, disabled: false }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#000000',
          marginRight: 16,
          flexGrow: 1,
        }}
        properties={{ text: 'Выбрать всё' }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#0099F7',
        }}
        properties={{ text: 'Удалить (3)' }}
      />
    </Row>
  )
}

function Price({ price }: { price: string }) {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', flexShrink: 0, marginBottom: 2 }}
      properties={{ text: price }}
    />
  )
}

function ProductTitle({ title }: { title: string }) {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', flexMode: 'adjustWidth' }}
      properties={{ text: title }}
    />
  )
}

function SellerSection({
  storeName,
  rating,
  reviewCount,
  checked,
}: {
  storeName: string
  rating: string
  reviewCount: string
  checked: boolean
}) {
  return (
    <Row
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flexStart',
        paddingHorizontal: 16,
        paddingVertical: 4,
      }}
    >
      <Checkbox style={{ borderRadius: 4, marginRight: 16 }} properties={{ checked: checked, disabled: false }} />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 21,
          fontWeight: '800',
          marginRight: 8,
        }}
        properties={{ text: storeName }}
      />
      <Image
        properties={{
          source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/star.png',
        }}
        style={{
          width: 16,
          height: 16,
          marginRight: 2,
          alignSelf: 'center',
        }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          marginRight: 4,
        }}
        properties={{ text: rating }}
      />
      <Text
        style={{
          fontFamily: 'Manrope',
          fontSize: 15,
          fontWeight: '500',
          color: '#A3A3A3',
        }}
        properties={{ text: reviewCount }}
      />
    </Row>
  )
}

function BuyWithDelivery() {
  return (
    <Text
      style={{ fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', color: '#A168F7' }}
      properties={{ text: 'Купить с доставкой' }}
    />
  )
}

function CountStepper({ quantity }: { quantity: number }) {
  return (
    <Stepper
      style={{ borderRadius: 12, marginVertical: 10 }}
      properties={{ value: quantity, minimumValue: 1, maximumValue: 10, disabled: false }}
    />
  )
}

function LikeButton() {
  return (
    <Image
      style={{ borderRadius: 6, width: 24, height: 24 }}
      properties={{
        source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/favorites.png',
      }}
    />
  )
}

function DeleteButton() {
  return (
    <Image
      style={{ borderRadius: 6, width: 24, height: 24 }}
      properties={{
        source: 'https://yhfeoztyhuiccuyeghiw.supabase.co/storage/v1/object/public/render-bucket/delete.png',
      }}
    />
  )
}

function ProductImage({ image }: { image: string }) {
  return <Image style={{ width: 96, height: 96, borderRadius: 12 }} properties={{ source: image }} />
}

function ProductCheckbox({ checked }: { checked: boolean }) {
  return <Checkbox style={{ borderRadius: 4, padding: 4 }} properties={{ checked: checked, disabled: false }} />
}

function CartItem({ image, price, title, quantity, checked }: any) {
  return (
    <Row
      style={{
        alignItems: 'stretch',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <ProductCheckbox checked={checked} />
      <ProductImage image={image} />

      <Row style={{ flexGrow: 1, flexMode: 'adjustWidth', flexShrink: 1 }}>
        <Column style={{ gap: 2, flexShrink: 1, flexMode: 'adjustWidth' }}>
          <Price price={price} />
          <ProductTitle title={title} />
          <CountStepper quantity={quantity} />
          <BuyWithDelivery />
        </Column>
      </Row>

      <Column style={{ gap: 6, flexShrink: 0 }}>
        <LikeButton />
        <DeleteButton />
      </Column>
    </Row>
  )
}

function BundleSection() {
  return (
    <Column style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
      <Row style={{ alignItems: 'center', gap: 6 }}>
        <Text
          style={{
            fontFamily: 'Manrope',
            fontSize: 24,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
          properties={{ text: '🎁' }}
        />
        <Column style={{ flexGrow: 1 }}>
          <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Manrope',
                fontSize: 14,
                fontWeight: '800',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Добавьте ещё 1 товар до скидки 5%' }}
            />
            <Button style={{ borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
          </Row>
        </Column>
      </Row>

      <Row style={{ gap: 16 }}>
        {/* Recommended Item 1 */}
        <BundleItem
          image="watch.png"
          currentPrice="26 591 ₽"
          originalPrice="27 990 ₽"
          title="Apple Watch 10 42mm Blue"
        />

        {/* Recommended Item 2 */}
        <BundleItem
          image="shorts.png"
          currentPrice="13 314 ₽"
          originalPrice="13 320 ₽"
          title="Шорты мужские новые 44 размер черные"
        />

        {/* More Items */}
        <Column
          style={{
            width: 94,
            height: 94,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Column style={{ alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontFamily: 'Manrope',
                fontSize: 15,
                fontWeight: '500',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
              properties={{ text: 'Ещё' }}
            />
            <Button style={{ borderRadius: 8, padding: 8 }} properties={{ title: '→' }} />
          </Column>
        </Column>
      </Row>
    </Column>
  )
}

function BundleItem({ image, currentPrice, originalPrice, title }: any) {
  return (
    <Column style={{ width: 236, gap: 12 }}>
      <Row style={{ alignItems: 'center', gap: 12 }}>
        <Image style={{ width: 94, height: 94, borderRadius: 12 }} properties={{ source: image }} />

        <Column style={{ gap: 12, width: 130 }}>
          <Column style={{ gap: 4 }}>
            <Row style={{ gap: 6 }}>
              <Text
                style={{
                  fontFamily: 'Manrope',
                  fontSize: 16,
                  fontWeight: '800',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
                properties={{ text: currentPrice }}
              />
              <Row style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Manrope',
                    fontSize: 15,
                    fontWeight: '500',
                    color: '#757575',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                  properties={{ text: originalPrice }}
                />
                <Text
                  style={{
                    fontFamily: 'Manrope',
                    color: '#757575',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                  properties={{ text: '─' }}
                />
              </Row>
            </Row>
            <Text
              style={{
                fontFamily: 'Manrope',
                fontSize: 11,
                fontWeight: '500',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
              properties={{ text: title }}
            />
          </Column>

          <Button
            style={{
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#E0E0E0',
            }}
            properties={{ title: 'В корзину' }}
          />
        </Column>
      </Row>
    </Column>
  )
}

function BottomBar() {
  return (
    <Column
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 28,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: -4 },
        shadowOpacity: 0.8,
        shadowRadius: 24,
        backgroundColor: '#DCDCDC',
      }}
    >
      <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 16 }}>
        <Column>
          <Text
            style={{
              fontFamily: 'Manrope',
              fontSize: 11,
              fontWeight: '500',
              color: '#000000',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
            properties={{ text: '3 товара' }}
          />
          <Text
            style={{
              fontFamily: 'Manrope',
              fontSize: 21,
              fontWeight: '800',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
            properties={{ text: '120 979 ₽' }}
          />
        </Column>

        <Button
          style={{ borderRadius: 16, paddingHorizontal: 18, paddingVertical: 17, backgroundColor: '#965EEB' }}
          titleStyle={{ color: '#FFFFFF', fontWeight: '500', fontSize: 15 }}
          properties={{ title: 'Оформить доставку' }}
        />
      </Row>
    </Column>
  )
}
`.trim()

export default function Editor() {
  const search = useSearch({ from: '/_authenticated/editor' })
  const { data: scenarioData, isLoading, isError } = useScenarioRaw(search.scenarioId ?? null)
  const [compiledScenario, setCompiledScenario] = useState<any>(null)

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

  const handleCompilationSuccess = (result: any) => {
    setCompiledScenario(result)
  }

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
          {!scenarioData && (
            <div className='flex gap-2'>
              <PublishDialog compiledScenario={compiledScenario} disabled={!compiledScenario} />
            </div>
          )}
        </div>
        <div className='flex-1 overflow-auto px-0 py-1'>
          {isLoading ? (
            <div className='flex h-[calc(100vh-12rem)] items-center justify-center'>
              <p className='text-muted-foreground'>Загрузка сценария...</p>
            </div>
          ) : isError && search.scenarioId ? (
            <div className='flex h-[calc(100vh-12rem)] items-center justify-center'>
              <p className='text-red-500'>Ошибка загрузки сценария. Проверьте подключение к базе данных.</p>
            </div>
          ) : (
            <div className='grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-3'>
              {/* Editor */}
              <div className='h-full overflow-hidden rounded-lg border lg:col-span-2'>
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

              {/* Compilation Panel */}
              {!scenarioData && (
                <div className='h-full overflow-auto rounded-lg border p-3 lg:col-span-1'>
                  <CompilationPanel jsxCode={code} onCompilationSuccess={handleCompilationSuccess} />
                </div>
              )}
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
