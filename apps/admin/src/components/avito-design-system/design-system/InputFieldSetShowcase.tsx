import React, { useState } from 'react'
import { InputFieldSet } from '../components/InputFieldSet'
import { cn } from '../utils/cn'

interface InputFieldSetShowcaseProps {
  className?: string
}

export const InputFieldSetShowcase: React.FC<InputFieldSetShowcaseProps> = ({ className }) => {
  const [inputValues, setInputValues] = useState({
    default: '',
    filled: 'BMW',
    error: '',
    errorFilled: 'BMW',
    disabled: 'BMW',
    hint: '',
    success: 'BMW',
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
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>InputFieldSet Component</h1>
          <p className='mt-2 text-lg text-gray-600'>
            A complete input field with label and status text following the Avito Design System.
          </p>
        </div>

        {/* Sizes */}
        <div className='mb-12'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900'>Sizes</h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
              <div key={size} className='rounded-lg border border-gray-200 p-6'>
                <h3 className='mb-4 text-sm font-medium text-gray-700 capitalize'>Size {size.toUpperCase()}</h3>
                <InputFieldSet
                  label='Заголовок'
                  placeholder='Марка'
                  value={inputValues.default}
                  onChange={handleInputChange('default')}
                  size={size}
                />
              </div>
            ))}
          </div>
        </div>

        {/* States */}
        <div className='mb-12'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900'>States</h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Default State</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.default}
                onChange={handleInputChange('default')}
              />
            </div>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Filled State</h3>
              <InputFieldSet
                label='Заголовок'
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
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.error}
                onChange={handleInputChange('error')}
                state='error'
                statusText='Ошибка'
                statusType='error'
              />
            </div>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Error Filled State</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.errorFilled}
                onChange={handleInputChange('errorFilled')}
                state='error-filled'
                statusText='Ошибка'
                statusType='error'
                showCloseButton
                onClear={handleClear('errorFilled')}
              />
            </div>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Disabled State</h3>
              <InputFieldSet label='Заголовок' placeholder='Марка' value={inputValues.disabled} state='disabled' />
            </div>
          </div>
        </div>

        {/* Status Types */}
        <div className='mb-12'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900'>Status Types</h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Error Status</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.error}
                onChange={handleInputChange('error')}
                state='error'
                statusText='Ошибка'
                statusType='error'
              />
            </div>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Hint Status</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.hint}
                onChange={handleInputChange('hint')}
                statusText='Подсказка'
                statusType='hint'
              />
            </div>
            <div className='rounded-lg border border-gray-200 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Success Status</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.success}
                onChange={handleInputChange('success')}
                statusText='Успех'
                statusType='success'
              />
            </div>
          </div>
        </div>

        {/* Overlay Preset */}
        <div className='mb-12'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900'>Overlay Preset - States</h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Default State</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.overlay}
                onChange={handleInputChange('overlay')}
                preset='overlay'
              />
            </div>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Filled State</h3>
              <InputFieldSet
                label='Заголовок'
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
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.overlayError}
                onChange={handleInputChange('overlayError')}
                state='error'
                preset='overlay'
                statusText='Ошибка'
                statusType='error'
              />
            </div>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Error Filled State</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.overlayErrorFilled}
                onChange={handleInputChange('overlayErrorFilled')}
                state='error-filled'
                preset='overlay'
                statusText='Ошибка'
                statusType='error'
                showCloseButton
                onClear={handleClear('overlayErrorFilled')}
              />
            </div>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-6'>
              <h3 className='mb-4 text-sm font-medium text-gray-700'>Disabled State</h3>
              <InputFieldSet
                label='Заголовок'
                placeholder='Марка'
                value={inputValues.overlayDisabled}
                state='disabled'
                preset='overlay'
              />
            </div>
          </div>
        </div>

        {/* Interactive Example */}
        <div className='mb-12'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900'>Interactive Example</h2>
          <div className='rounded-lg border border-gray-200 p-6'>
            <div className='mb-4'>
              <InputFieldSet
                label='Марка автомобиля'
                placeholder='Введите марку'
                value={inputValues.default}
                onChange={handleInputChange('default')}
                showCloseButton
                onClear={handleClear('default')}
                statusText={inputValues.default ? 'Отлично!' : 'Введите марку автомобиля'}
                statusType={inputValues.default ? 'success' : 'hint'}
              />
            </div>
            <p className='mt-2 text-xs text-gray-500'>Current value: "{inputValues.default || 'empty'}"</p>
          </div>
        </div>
      </div>
    </div>
  )
}
