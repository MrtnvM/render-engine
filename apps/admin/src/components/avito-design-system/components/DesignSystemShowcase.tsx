import React from 'react'
import { Button } from './Button'

// Section Header Component
const SectionHeader: React.FC = () => (
  <div className='mb-8'>
    <div className='inline-flex items-center gap-2 text-purple-600'>
      <span className='text-2xl'>💎</span>
      <h1 className='text-xl font-semibold'>Button</h1>
    </div>
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
    <div
      className={
        variantType === 'ghost'
          ? 'flex w-48 items-center justify-center'
          : 'flex w-48 items-center justify-around gap-4'
      }
    >
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

export const DesignSystemShowcase: React.FC = () => (
  <div className='min-h-screen bg-white p-8' style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-full'>
      <SectionHeader />
      <div className='flex gap-4 overflow-x-auto'>
        <div className='flex-1 overflow-x-auto'>
          <div className='overflow-x-auto rounded-lg border-2 border-dashed border-purple-400 bg-white p-6'>
            <div className='w-full min-w-max'>
              <ColumnHeaders />
              <ButtonVariantsShowcase />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
