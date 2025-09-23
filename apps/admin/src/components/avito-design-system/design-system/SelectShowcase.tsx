import React from 'react'
import { Select } from '../components/Select'
import { SelectOption } from '../types/components'
import { cn } from '../utils/cn'

interface SelectShowcaseProps {
  className?: string
}

// Sample options for the showcase
const sampleOptions: SelectOption[] = [
  { value: 'option1', label: 'Первая опция' },
  { value: 'option2', label: 'Вторая опция' },
  { value: 'option3', label: 'Третья опция' },
  { value: 'option4', label: 'Четвертая опция', disabled: true },
  { value: 'option5', label: 'Пятая опция' },
]

const countryOptions: SelectOption[] = [
  { value: 'ru', label: 'Россия' },
  { value: 'us', label: 'США' },
  { value: 'de', label: 'Германия' },
  { value: 'fr', label: 'Франция' },
  { value: 'jp', label: 'Япония' },
]

// Section Header Component
const SectionHeader: React.FC = () => (
  <div className='mb-8'>
    <div className='inline-flex items-center gap-2 text-purple-600'>
      <span className='text-2xl'>🔽</span>
      <h1 className='text-2xl font-bold'>Select Component</h1>
    </div>
    <p className='mt-2 text-gray-600'>
      Comprehensive showcase of select components with all variants, sizes, and states
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

// Select Variant Group Item Component
interface SelectVariantGroupItemProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'error' | 'disabled' | 'overlay'
}

const SelectVariantGroupItem: React.FC<SelectVariantGroupItemProps> = ({ size, variantType }) => {
  const getSelectConfig = () => {
    switch (variantType) {
      case 'default':
        return [
          { state: 'default' as const, value: '', placeholder: 'Выберите опцию', preset: 'default' as const },
          { state: 'filled' as const, value: 'option1', placeholder: 'Выберите опцию', preset: 'default' as const },
        ]
      case 'error':
        return [
          { state: 'error' as const, value: '', placeholder: 'Выберите опцию', preset: 'default' as const },
          {
            state: 'error-filled' as const,
            value: 'option2',
            placeholder: 'Выберите опцию',
            preset: 'default' as const,
          },
        ]
      case 'disabled':
        return [
          { state: 'disabled' as const, value: 'option1', placeholder: 'Выберите опцию', preset: 'default' as const },
        ]
      case 'overlay':
        return [
          { state: 'default' as const, value: '', placeholder: 'Выберите опцию', preset: 'overlay' as const },
          { state: 'filled' as const, value: 'option1', placeholder: 'Выберите опцию', preset: 'overlay' as const },
        ]
      default:
        return []
    }
  }

  const selectConfigs = getSelectConfig()

  return (
    <div
      className={cn('flex w-48 items-center', variantType === 'disabled' ? 'justify-center' : 'justify-around gap-4')}
    >
      {selectConfigs.map((config, index) => (
        <Select
          key={index}
          size={size}
          state={config.state}
          preset={config.preset}
          options={sampleOptions}
          value={config.value}
          placeholder={config.placeholder}
          onChange={() => {}}
        />
      ))}
    </div>
  )
}

// Select Variant Group Component
interface SelectVariantGroupProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'error' | 'disabled' | 'overlay'
}

const SelectVariantGroup: React.FC<SelectVariantGroupProps> = ({ size, variantType }) => (
  <SelectVariantGroupItem size={size} variantType={variantType} />
)

// Select Size Row Component
interface SelectSizeRowProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
}

const SelectSizeRow: React.FC<SelectSizeRowProps> = ({ size }) => (
  <div key={`rect-${size}`} className='flex items-center gap-8'>
    <div className='flex w-20 flex-shrink-0 items-center justify-center'>
      <span className='text-sm font-medium text-gray-900 uppercase'>{size}</span>
    </div>
    <SelectVariantGroup size={size} variantType='default' />
    <SelectVariantGroup size={size} variantType='error' />
    <SelectVariantGroup size={size} variantType='disabled' />
    <SelectVariantGroup size={size} variantType='overlay' />
  </div>
)

// Interactive Select Examples Section
const InteractiveExamples: React.FC = () => {
  const [selectedValue1, setSelectedValue1] = React.useState<string>('')
  const [selectedValue2, setSelectedValue2] = React.useState<string>('')
  const [selectedValue3, setSelectedValue3] = React.useState<string>('ru')

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Interactive Examples</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Basic Select</h3>
          <div className='space-y-2'>
            <Select
              size='m'
              state='default'
              options={sampleOptions}
              value={selectedValue1}
              placeholder='Выберите опцию'
              onChange={setSelectedValue1}
            />
            <p className='text-xs text-gray-500'>Выбрано: {selectedValue1 || 'ничего'}</p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Error State</h3>
          <div className='space-y-2'>
            <Select
              size='m'
              state='error'
              options={sampleOptions}
              value={selectedValue2}
              placeholder='Выберите опцию'
              onChange={setSelectedValue2}
            />
            <p className='text-xs text-red-500'>Пожалуйста, выберите опцию</p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Country Select</h3>
          <div className='space-y-2'>
            <Select
              size='m'
              state='filled'
              options={countryOptions}
              value={selectedValue3}
              placeholder='Выберите страну'
              onChange={setSelectedValue3}
            />
            <p className='text-xs text-gray-500'>
              Страна: {countryOptions.find((opt) => opt.value === selectedValue3)?.label || 'не выбрана'}
            </p>
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
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Different Sizes</h3>
        <div className='space-y-3'>
          <Select size='xs' state='default' options={sampleOptions} placeholder='Extra Small' onChange={() => {}} />
          <Select
            size='s'
            state='filled'
            options={sampleOptions}
            value='option1'
            placeholder='Small'
            onChange={() => {}}
          />
          <Select size='m' state='default' options={sampleOptions} placeholder='Medium' onChange={() => {}} />
          <Select
            size='l'
            state='filled'
            options={sampleOptions}
            value='option2'
            placeholder='Large'
            onChange={() => {}}
          />
          <Select size='xl' state='default' options={sampleOptions} placeholder='Extra Large' onChange={() => {}} />
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Overlay Preset</h3>
        <div className='space-y-3'>
          <Select
            size='m'
            state='default'
            preset='overlay'
            options={sampleOptions}
            placeholder='Overlay Default'
            onChange={() => {}}
          />
          <Select
            size='m'
            state='filled'
            preset='overlay'
            options={sampleOptions}
            value='option1'
            placeholder='Overlay Filled'
            onChange={() => {}}
          />
          <Select
            size='m'
            state='error'
            preset='overlay'
            options={sampleOptions}
            placeholder='Overlay Error'
            onChange={() => {}}
          />
          <Select
            size='m'
            state='disabled'
            preset='overlay'
            options={sampleOptions}
            value='option2'
            placeholder='Overlay Disabled'
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  </div>
)

export const SelectShowcase: React.FC<SelectShowcaseProps> = ({ className }) => (
  <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-7xl'>
      <SectionHeader />

      <InteractiveExamples />
      <SpecialStatesSection />
    </div>
  </div>
)
