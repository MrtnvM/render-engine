import React, { useState } from 'react'
import { Input } from '../components/Input'
import { cn } from '../utils/cn'

interface InputShowcaseProps {
  className?: string
}

export const InputShowcase: React.FC<InputShowcaseProps> = ({ className }) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    default: '',
    filled: 'BMW',
    error: '',
    errorFilled: 'BMW',
    disabled: 'BMW',
    overlay: '',
    overlayFilled: 'BMW',
    overlayError: '',
    overlayErrorFilled: 'BMW',
    overlayDisabled: 'BMW',
  })

  const handleInputChange = (key: string) => (value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleClear = (key: string) => () => {
    setInputValues((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
      <div className='mx-auto max-w-7xl p-6'>
        <div className='mb-8'>
          <div className='inline-flex items-center gap-2 text-purple-600'>
            <span className='text-2xl'>📝</span>
            <h1 className='text-2xl font-bold'>Input Component</h1>
          </div>
          <p className='mt-2 text-gray-600'>
            Text input component with multiple sizes, states, and presets following the Avito Design System
          </p>
        </div>

        <div className='space-y-12'>
          {/* Sizes Section */}
          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>Sizes</h2>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
                <div key={size} className='rounded-lg border border-gray-200 p-6'>
                  <h3 className='mb-4 text-sm font-medium text-gray-700 capitalize'>Size {size.toUpperCase()}</h3>
                  <div className='space-y-3'>
                    <Input
                      size={size}
                      placeholder='Марка'
                      value={inputValues.default}
                      onChange={handleInputChange('default')}
                    />
                    <Input
                      size={size}
                      placeholder='Марка'
                      value={inputValues.filled}
                      onChange={handleInputChange('filled')}
                      state='filled'
                      showCloseButton
                      onClear={handleClear('filled')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Default Preset States */}
          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>Default Preset - States</h2>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <div className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Default State</h3>
                <Input placeholder='Марка' value={inputValues.default} onChange={handleInputChange('default')} />
              </div>
              <div className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Filled State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.filled}
                  onChange={handleInputChange('filled')}
                  state='filled'
                  showCloseButton
                  onClear={handleClear('filled')}
                />
              </div>
              <div className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Error State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.error}
                  onChange={handleInputChange('error')}
                  state='error'
                />
              </div>
              <div className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Error Filled State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.errorFilled}
                  onChange={handleInputChange('errorFilled')}
                  state='error-filled'
                  showCloseButton
                  onClear={handleClear('errorFilled')}
                />
              </div>
              <div className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Disabled State</h3>
                <Input placeholder='Марка' value={inputValues.disabled} state='disabled' />
              </div>
            </div>
          </div>

          {/* Overlay Preset States */}
          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>Overlay Preset - States</h2>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Default State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.overlay}
                  onChange={handleInputChange('overlay')}
                  preset='overlay'
                />
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Filled State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.overlayFilled}
                  onChange={handleInputChange('overlayFilled')}
                  state='filled'
                  preset='overlay'
                  showCloseButton
                  onClear={handleClear('overlayFilled')}
                />
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Error State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.overlayError}
                  onChange={handleInputChange('overlayError')}
                  state='error'
                  preset='overlay'
                />
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Error Filled State</h3>
                <Input
                  placeholder='Марка'
                  value={inputValues.overlayErrorFilled}
                  onChange={handleInputChange('overlayErrorFilled')}
                  state='error-filled'
                  preset='overlay'
                  showCloseButton
                  onClear={handleClear('overlayErrorFilled')}
                />
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700'>Disabled State</h3>
                <Input placeholder='Марка' value={inputValues.overlayDisabled} state='disabled' preset='overlay' />
              </div>
            </div>
          </div>

          {/* Interactive Example */}
          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>Interactive Example</h2>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Try typing and clearing</h3>
              <div className='max-w-md'>
                <Input
                  placeholder='Enter your brand name'
                  value={inputValues.default}
                  onChange={handleInputChange('default')}
                  showCloseButton
                  onClear={handleClear('default')}
                />
                <p className='mt-2 text-xs text-gray-500'>Current value: "{inputValues.default || 'empty'}"</p>
              </div>
            </div>
          </div>

          {/* Accessibility Notes */}
          <div>
            <h2 className='mb-6 text-xl font-semibold text-gray-900'>Accessibility Features</h2>
            <div className='rounded-lg border border-gray-200 p-6'>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>• Proper ARIA attributes for screen readers</li>
                <li>• Keyboard navigation support</li>
                <li>• Clear button with proper labeling</li>
                <li>• Focus management and visual indicators</li>
                <li>• Disabled state handling</li>
                <li>• Error state communication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
