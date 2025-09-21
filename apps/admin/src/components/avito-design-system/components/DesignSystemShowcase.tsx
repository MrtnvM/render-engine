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

        {/* Layout with size labels on the left and scrollable content */}
        <div className='flex gap-4 overflow-x-auto'>
          <div className='flex-1 overflow-x-auto'>
            <div className='overflow-x-auto rounded-lg border-2 border-dashed border-purple-400 bg-white p-6'>
              <div className='w-full min-w-max'>
                {/* Column Headers */}
                <div className='mb-6 grid grid-cols-6 gap-8 text-center'>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Default</h3>
                    <div className='mt-1 grid grid-cols-2 gap-1'>
                      <span className='text-xs text-gray-600'>Default</span>
                      <span className='text-xs text-gray-600'>Disabled</span>
                    </div>
                  </div>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Accent</h3>
                    <div className='mt-1 grid grid-cols-2 gap-1'>
                      <span className='text-xs text-gray-600'>Default</span>
                      <span className='text-xs text-gray-600'>Disabled</span>
                    </div>
                  </div>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Pay</h3>
                    <div className='mt-1 grid grid-cols-2 gap-1'>
                      <span className='text-xs text-gray-600'>Default</span>
                      <span className='text-xs text-gray-600'>Disabled</span>
                    </div>
                  </div>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Success</h3>
                    <div className='mt-1 grid grid-cols-2 gap-1'>
                      <span className='text-xs text-gray-600'>Default</span>
                      <span className='text-xs text-gray-600'>Disabled</span>
                    </div>
                  </div>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Danger</h3>
                    <div className='mt-1 grid grid-cols-2 gap-1'>
                      <span className='text-xs text-gray-600'>Default</span>
                      <span className='text-xs text-gray-600'>Disabled</span>
                    </div>
                  </div>
                  <div className='border-b-2 border-gray-200 pb-2'>
                    <h3 className='text-sm font-medium text-gray-900'>Ghost</h3>
                  </div>
                </div>

                {/* Rectangular Buttons Grid */}
                <div className='space-y-3'>
                  {sizes.map((size) => (
                    <div key={`rect-${size}`} className='grid grid-cols-6 items-center gap-8'>
                      {/* Default Group - Primary and Secondary */}
                      <div className='grid grid-cols-2 gap-2'>
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
                      <div className='grid grid-cols-2 gap-2'>
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
                      <div className='grid grid-cols-2 gap-2'>
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
                      <div className='grid grid-cols-2 gap-2'>
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
                      <div className='grid grid-cols-2 gap-2'>
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
                      <div className='flex items-center justify-center'>
                        <Button size={size} variant='ghost' color='default'>
                          Текст
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
