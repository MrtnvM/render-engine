import React from 'react'
import { cn } from '../utils/cn'

export interface ComponentShowcaseProps {
  selectedComponent: string | null
  children: React.ReactNode
  className?: string
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ selectedComponent, children, className }) => {
  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      <div className='p-6'>
        {selectedComponent ? (
          <div className='space-y-6'>{children}</div>
        ) : (
          <div className='flex h-96 items-center justify-center'>
            <div className='text-center'>
              <div className='mb-4 text-6xl'>🎨</div>
              <h2 className='mb-2 text-xl font-semibold text-gray-900'>Select a Component</h2>
              <p className='text-gray-600'>Choose a component from the sidebar to view its showcase</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
