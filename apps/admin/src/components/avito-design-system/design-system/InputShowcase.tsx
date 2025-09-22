import React from 'react'
import { cn } from '../utils/cn'

interface InputShowcaseProps {
  className?: string
}

// Placeholder Input component for demonstration
const Input: React.FC<{
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}> = ({ placeholder, disabled, error, className }) => (
  <input
    className={cn(
      'rounded-md border px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none',
      error && 'border-red-500',
      disabled && 'cursor-not-allowed bg-gray-100',
      className,
    )}
    placeholder={placeholder}
    disabled={disabled}
  />
)

export const InputShowcase: React.FC<InputShowcaseProps> = ({ className }) => (
  <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8'>
        <div className='inline-flex items-center gap-2 text-purple-600'>
          <span className='text-2xl'>📝</span>
          <h1 className='text-2xl font-bold'>Input Component</h1>
        </div>
        <p className='mt-2 text-gray-600'>Text input component with validation states and various configurations</p>
      </div>

      <div className='space-y-8'>
        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>Basic Examples</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='mb-2 text-sm font-medium text-gray-700'>Default State</h3>
              <Input placeholder='Enter your text here' />
            </div>
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='mb-2 text-sm font-medium text-gray-700'>Disabled State</h3>
              <Input placeholder='Disabled input' disabled />
            </div>
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='mb-2 text-sm font-medium text-gray-700'>Error State</h3>
              <Input placeholder='Input with error' error />
            </div>
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='mb-2 text-sm font-medium text-gray-700'>Success State</h3>
              <Input placeholder='Valid input' className='border-green-500' />
            </div>
          </div>
        </div>

        <div>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>Different Sizes</h2>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <span className='w-20 text-sm font-medium text-gray-700'>Small:</span>
              <Input placeholder='Small input' className='px-2 py-1 text-sm' />
            </div>
            <div className='flex items-center gap-4'>
              <span className='w-20 text-sm font-medium text-gray-700'>Medium:</span>
              <Input placeholder='Medium input' />
            </div>
            <div className='flex items-center gap-4'>
              <span className='w-20 text-sm font-medium text-gray-700'>Large:</span>
              <Input placeholder='Large input' className='px-4 py-3 text-lg' />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
