import React from 'react'
import { Button } from './Button'

export const DesignSystemShowcase: React.FC = () => {
  const sizes = ['m', 'xl', 'l', 's', 'xs'] as const

  return (
    <div className='min-h-screen bg-white p-8' style={{ fontFamily: 'var(--avito-font-family)' }}>
      <div className='mx-auto max-w-full'>
        {/* Purple Button Section Header */}
        <div className='mb-8'>
          <div className='inline-flex items-center gap-2 text-purple-600'>
            <span className='text-2xl'>💎</span>
            <h1 className='text-xl font-semibold'>Button</h1>
          </div>
        </div>

        {/* Main Showcase Container */}
        <div className='rounded-lg border-2 border-dashed border-purple-400 bg-white p-6'>
          {/* Column Headers */}
          <div className='mb-6 grid grid-cols-12 gap-3 text-center'>
            <div className='col-span-1'></div> {/* Size column */}
            <div className='col-span-2 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Default</h3>
              <div className='mt-1 grid grid-cols-2 gap-1'>
                <span className='text-xs text-gray-600'>Default</span>
                <span className='text-xs text-gray-600'>Disabled</span>
              </div>
            </div>
            <div className='col-span-2 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Accent</h3>
              <div className='mt-1 grid grid-cols-2 gap-1'>
                <span className='text-xs text-gray-600'>Default</span>
                <span className='text-xs text-gray-600'>Disabled</span>
              </div>
            </div>
            <div className='col-span-2 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Pay</h3>
              <div className='mt-1 grid grid-cols-2 gap-1'>
                <span className='text-xs text-gray-600'>Default</span>
                <span className='text-xs text-gray-600'>Disabled</span>
              </div>
            </div>
            <div className='col-span-2 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Success</h3>
              <div className='mt-1 grid grid-cols-2 gap-1'>
                <span className='text-xs text-gray-600'>Default</span>
                <span className='text-xs text-gray-600'>Disabled</span>
              </div>
            </div>
            <div className='col-span-2 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Danger</h3>
              <div className='mt-1 grid grid-cols-2 gap-1'>
                <span className='text-xs text-gray-600'>Default</span>
                <span className='text-xs text-gray-600'>Disabled</span>
              </div>
            </div>
            <div className='col-span-1 border-b-2 border-gray-200 pb-2'>
              <h3 className='text-sm font-medium text-gray-900'>Ghost</h3>
            </div>
          </div>

          {/* Rectangular Buttons Grid */}
          <div className='space-y-3'>
            {sizes.map((size) => (
              <div key={`rect-${size}`} className='grid grid-cols-12 items-center gap-3'>
                {/* Size Label */}
                <div className='col-span-1 flex items-center justify-start'>
                  <span className='text-sm font-medium text-gray-600 uppercase'>{size}</span>
                </div>

                {/* Default Group - Primary and Secondary */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='default'>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='default' disabled>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Accent Group - Blue variants */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='accent'>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='accent'>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Pay Group - Purple variants */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='pay'>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='pay'>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Success Group - Green variants */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='success'>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='success'>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Danger Group - Red variants */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='danger'>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='danger'>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Ghost Group */}
                <div className='col-span-1 flex items-center justify-center'>
                  <Button size={size} variant='ghost' color='default'>
                    Текст
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Spacing between rectangular and round buttons */}
          <div className='my-8 border-t border-gray-200'></div>

          {/* Round Buttons Grid */}
          <div className='space-y-3'>
            {sizes.map((size) => (
              <div key={`round-${size}`} className='grid grid-cols-12 items-center gap-3'>
                {/* Size Label */}
                <div className='col-span-1 flex items-center justify-start'>
                  <span className='text-sm font-medium text-gray-600 uppercase'>{size}</span>
                </div>

                {/* Default Group - Primary and Secondary Round */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='default' round>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='default' round disabled>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Accent Group - Blue variants Round */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='accent' round>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='accent' round>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Pay Group - Purple variants Round */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='pay' round>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='pay' round>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Success Group - Green variants Round */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='success' round>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='success' round>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Danger Group - Red variants Round */}
                <div className='col-span-2 grid grid-cols-2 gap-2'>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='primary' color='danger' round>
                      Текст
                    </Button>
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button size={size} variant='secondary' color='danger' round>
                      Текст
                    </Button>
                  </div>
                </div>

                {/* Ghost Group Round */}
                <div className='col-span-1 flex items-center justify-center'>
                  <Button size={size} variant='ghost' color='default' round>
                    Текст
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
