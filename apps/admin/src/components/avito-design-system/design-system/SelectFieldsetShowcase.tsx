import React, { useState } from 'react'
import { SelectFieldset } from '../components/SelectFieldset'
import { cn } from '../utils/cn'

interface SelectFieldsetShowcaseProps {
  className?: string
}

const sampleOptions = [
  { value: 'option1', label: 'Текст' },
  { value: 'option2', label: 'Другой вариант' },
  { value: 'option3', label: 'Третий вариант' },
  { value: 'option4', label: 'Четвертый вариант' },
  { value: 'option5', label: 'Пятый вариант' },
]

// Section Header Component
const SectionHeader: React.FC = () => (
  <div className='mb-8'>
    <div className='inline-flex items-center gap-2 text-purple-600'>
      <span className='text-2xl'>🔽</span>
      <h1 className='text-2xl font-bold'>Select Fieldset Component</h1>
    </div>
    <p className='mt-2 text-gray-600'>
      Comprehensive showcase of select fieldset components with all variants, sizes, and states
    </p>
  </div>
)

// Interactive Examples Section
const InteractiveExamples: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('')

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Interactive Examples</h2>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <h3 className='text-base font-medium text-gray-700'>Basic Usage</h3>
          <SelectFieldset
            label='Заголовок'
            placeholder='Выберите'
            value={selectedValue}
            options={sampleOptions}
            onChange={setSelectedValue}
          />
        </div>

        <div className='space-y-4'>
          <h3 className='text-base font-medium text-gray-700'>With Error</h3>
          <SelectFieldset
            label='Заголовок'
            placeholder='Выберите'
            value='Иномарка'
            options={sampleOptions}
            state='error'
            errorText='Выберите хотя бы один вариант'
          />
        </div>
      </div>
    </div>
  )
}

// Size Variants Section
const SizeVariantsSection: React.FC = () => {
  const sizes = [
    { size: 'xs' as const, label: 'Extra Small' },
    { size: 's' as const, label: 'Small' },
    { size: 'm' as const, label: 'Medium' },
    { size: 'l' as const, label: 'Large' },
    { size: 'xl' as const, label: 'Extra Large' },
  ]

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Size Variants</h2>
      <div className='space-y-6'>
        {sizes.map(({ size, label }) => (
          <div key={size} className='space-y-2'>
            <h3 className='text-sm font-medium text-gray-600'>
              {label} ({size.toUpperCase()})
            </h3>
            <SelectFieldset
              label='Заголовок'
              placeholder='Выберите'
              value='Иномарка'
              options={sampleOptions}
              size={size}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// State Variants Section
const StateVariantsSection: React.FC = () => {
  const states = [
    { state: 'default' as const, label: 'Default' },
    { state: 'filled' as const, label: 'Filled' },
    { state: 'disabled' as const, label: 'Disabled' },
    { state: 'error' as const, label: 'Error' },
    { state: 'active' as const, label: 'Active' },
  ]

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>State Variants</h2>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {states.map(({ state, label }) => (
          <div key={state} className='space-y-2'>
            <h3 className='text-sm font-medium text-gray-600'>{label}</h3>
            <SelectFieldset
              label='Заголовок'
              placeholder='Выберите'
              value={state === 'filled' || state === 'active' ? 'Иномарка' : ''}
              options={sampleOptions}
              state={state}
              errorText={state === 'error' ? 'Выберите хотя бы один вариант' : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Special States Section
const SpecialStatesSection: React.FC = () => {
  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Special States</h2>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <h3 className='text-base font-medium text-gray-700'>With Hint Text</h3>
          <SelectFieldset label='Заголовок' placeholder='Выберите' options={sampleOptions} hintText='Подсказка' />
        </div>

        <div className='space-y-4'>
          <h3 className='text-base font-medium text-gray-700'>With Success Text</h3>
          <SelectFieldset
            label='Заголовок'
            placeholder='Выберите'
            value='Иномарка'
            options={sampleOptions}
            successText='Успех'
          />
        </div>
      </div>
    </div>
  )
}


export const SelectFieldsetShowcase: React.FC<SelectFieldsetShowcaseProps> = ({ className }) => (
  <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-7xl'>
      <SectionHeader />

      <InteractiveExamples />
      <SizeVariantsSection />
      <StateVariantsSection />
      <SpecialStatesSection />
    </div>
  </div>
)
