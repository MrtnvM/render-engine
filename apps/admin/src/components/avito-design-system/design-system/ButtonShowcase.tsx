import React from 'react'
import { Button } from '../components/Button'
import { cn } from '../utils/cn'

interface ButtonShowcaseProps {
  className?: string
}

// Section Header Component
const SectionHeader: React.FC = () => (
  <div className='mb-8'>
    <div className='inline-flex items-center gap-2 text-purple-600'>
      <span className='text-2xl'>🔘</span>
      <h1 className='text-2xl font-bold'>Button Component</h1>
    </div>
    <p className='mt-2 text-gray-600'>
      Comprehensive showcase of button components with all variants, sizes, and states
    </p>
  </div>
)

// Column Header Item Component
interface ColumnHeaderItemProps {
  title: string
  subLabels?: string[]
  className?: string
  width?: string
}

const ColumnHeaderItem: React.FC<ColumnHeaderItemProps> = ({
  title,
  subLabels,
  className = 'flex-1',
  width = 'w-48',
}) => (
  <div className={`${width} ${className} border-b-2 border-gray-200 pb-2`}>
    <h3 className='text-sm font-medium text-gray-900'>{title}</h3>
    {subLabels && subLabels.length > 0 && (
      <div className='mt-1 grid grid-cols-2 gap-1'>
        {subLabels.map((label, index) => (
          <span key={index} className='text-xs text-gray-600'>
            {label}
          </span>
        ))}
      </div>
    )}
  </div>
)

// Column Headers Component
const ColumnHeaders: React.FC = () => (
  <div className='mb-6 flex gap-8 text-center'>
    <ColumnHeaderItem title='Size' className='flex-shrink-0' width='w-20' />
    <ColumnHeaderItem title='Default' subLabels={['Secondary', 'Primary']} />
    <ColumnHeaderItem title='Accent' subLabels={['Primary', 'Secondary']} />
    <ColumnHeaderItem title='Pay' subLabels={['Primary', 'Secondary']} />
    <ColumnHeaderItem title='Success' subLabels={['Primary', 'Secondary']} />
    <ColumnHeaderItem title='Danger' subLabels={['Primary', 'Secondary']} />
    <ColumnHeaderItem title='Ghost' />
  </div>
)

// Button Variant Group Item Component
interface ButtonVariantGroupItemProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'accent' | 'pay' | 'success' | 'danger' | 'ghost'
}

const ButtonVariantGroupItem: React.FC<ButtonVariantGroupItemProps> = ({ size, variantType }) => {
  const getButtonConfig = () => {
    switch (variantType) {
      case 'default':
        return [
          { variant: 'secondary' as const, color: 'default' as const },
          { variant: 'primary' as const, color: 'default' as const },
        ]
      case 'accent':
        return [
          { variant: 'primary' as const, color: 'accent' as const },
          { variant: 'secondary' as const, color: 'accent' as const },
        ]
      case 'pay':
        return [
          { variant: 'primary' as const, color: 'pay' as const },
          { variant: 'secondary' as const, color: 'pay' as const },
        ]
      case 'success':
        return [
          { variant: 'primary' as const, color: 'success' as const },
          { variant: 'secondary' as const, color: 'success' as const },
        ]
      case 'danger':
        return [
          { variant: 'primary' as const, color: 'danger' as const },
          { variant: 'secondary' as const, color: 'danger' as const },
        ]
      case 'ghost':
        return [{ variant: 'ghost' as const, color: 'default' as const }]
      default:
        return []
    }
  }

  const buttonConfigs = getButtonConfig()

  return (
    <div className={cn('flex w-48 items-center', variantType === 'ghost' ? 'justify-center' : 'justify-around gap-4')}>
      {buttonConfigs.map((config, index) => (
        <Button key={index} size={size} variant={config.variant} color={config.color}>
          Текст
        </Button>
      ))}
    </div>
  )
}

// Button Variant Group Component
interface ButtonVariantGroupProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'accent' | 'pay' | 'success' | 'danger' | 'ghost'
}

const ButtonVariantGroup: React.FC<ButtonVariantGroupProps> = ({ size, variantType }) => (
  <ButtonVariantGroupItem size={size} variantType={variantType} />
)

// Button Size Row Component
interface ButtonSizeRowProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
}

const ButtonSizeRow: React.FC<ButtonSizeRowProps> = ({ size }) => (
  <div key={`rect-${size}`} className='flex items-center gap-8'>
    <div className='flex w-20 flex-shrink-0 items-center justify-center'>
      <span className='text-sm font-medium text-gray-900 uppercase'>{size}</span>
    </div>
    <ButtonVariantGroup size={size} variantType='default' />
    <ButtonVariantGroup size={size} variantType='accent' />
    <ButtonVariantGroup size={size} variantType='pay' />
    <ButtonVariantGroup size={size} variantType='success' />
    <ButtonVariantGroup size={size} variantType='danger' />
    <ButtonVariantGroup size={size} variantType='ghost' />
  </div>
)

// Button Variants Showcase Component
const ButtonVariantsShowcase: React.FC = () => {
  const sizes = ['m', 'xl', 'l', 's', 'xs'] as const

  return (
    <div className='space-y-3'>
      {sizes.map((size) => (
        <ButtonSizeRow key={`row-${size}`} size={size} />
      ))}
    </div>
  )
}

// Interactive Button Examples Section
const InteractiveExamples: React.FC = () => {
  const [clickedButton, setClickedButton] = React.useState<string | null>(null)

  const handleButtonClick = (buttonId: string) => {
    setClickedButton(buttonId)
    setTimeout(() => setClickedButton(null), 1000)
  }

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Interactive Examples</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Primary Actions</h3>
          <div className='space-y-2'>
            <Button variant='primary' color='default' size='m' onClick={() => handleButtonClick('primary-default')}>
              {clickedButton === 'primary-default' ? 'Clicked!' : 'Primary Default'}
            </Button>
            <Button variant='primary' color='accent' size='m' onClick={() => handleButtonClick('primary-accent')}>
              {clickedButton === 'primary-accent' ? 'Clicked!' : 'Primary Accent'}
            </Button>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Secondary Actions</h3>
          <div className='space-y-2'>
            <Button variant='secondary' color='default' size='m' onClick={() => handleButtonClick('secondary-default')}>
              {clickedButton === 'secondary-default' ? 'Clicked!' : 'Secondary Default'}
            </Button>
            <Button variant='secondary' color='success' size='m' onClick={() => handleButtonClick('secondary-success')}>
              {clickedButton === 'secondary-success' ? 'Clicked!' : 'Secondary Success'}
            </Button>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Ghost & Disabled</h3>
          <div className='space-y-2'>
            <Button variant='ghost' color='default' size='m' onClick={() => handleButtonClick('ghost-default')}>
              {clickedButton === 'ghost-default' ? 'Clicked!' : 'Ghost Button'}
            </Button>
            <Button variant='primary' color='default' size='m' disabled>
              Disabled Button
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Special States Section
const SpecialStatesSection: React.FC = () => (
  <div className='mb-8'>
    <h2 className='mb-4 text-lg font-semibold text-gray-900'>Special States & Presets</h2>
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='rounded-lg border border-gray-200 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Round Buttons</h3>
        <div className='flex flex-wrap gap-2'>
          <Button variant='primary' color='accent' size='s' round>
            Round S
          </Button>
          <Button variant='primary' color='pay' size='m' round>
            Round M
          </Button>
          <Button variant='secondary' color='success' size='l' round>
            Round L
          </Button>
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Overlay Preset</h3>
        <div className='flex flex-wrap gap-2'>
          <Button variant='primary' color='default' size='s' preset='overlay'>
            Overlay S
          </Button>
          <Button variant='secondary' color='accent' size='m' preset='overlay'>
            Overlay M
          </Button>
          <Button variant='primary' color='default' size='s' preset='overlay' disabled>
            Disabled
          </Button>
        </div>
      </div>
    </div>
  </div>
)

export const ButtonShowcase: React.FC<ButtonShowcaseProps> = ({ className }) => (
  <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-7xl'>
      <SectionHeader />

      <InteractiveExamples />
      <SpecialStatesSection />
    </div>
  </div>
)
