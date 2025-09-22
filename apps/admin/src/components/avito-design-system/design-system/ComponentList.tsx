import React from 'react'
import { cn } from '../utils/cn'

export interface ComponentItem {
  id: string
  name: string
  description: string
  category: string
  icon?: string
}

interface ComponentListProps {
  components: ComponentItem[]
  selectedComponent: string | null
  onComponentSelect: (componentId: string) => void
  className?: string
}

export const ComponentList: React.FC<ComponentListProps> = ({
  components,
  selectedComponent,
  onComponentSelect,
  className,
}) => {
  const groupedComponents = components.reduce(
    (acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = []
      }
      acc[component.category].push(component)
      return acc
    },
    {} as Record<string, ComponentItem[]>,
  )

  return (
    <div className={cn('w-72 flex-shrink-0 border-r border-l border-gray-200 bg-gray-50', className)}>
      <div className='p-4'>
        <h2 className='mb-3 text-base font-semibold text-gray-900'>Components</h2>
        <div className='space-y-4'>
          {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
            <div key={category}>
              <h3 className='mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase'>{category}</h3>
              <div className='space-y-0.5'>
                {categoryComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => onComponentSelect(component.id)}
                    className={cn(
                      'w-full rounded-md p-2 text-left transition-colors duration-200',
                      'hover:bg-gray-100 focus:ring-1 focus:ring-purple-500 focus:ring-offset-1 focus:outline-none',
                      selectedComponent === component.id
                        ? 'border border-purple-200 bg-purple-50 text-purple-900'
                        : 'text-gray-700 hover:text-gray-900',
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      {component.icon && <span className='flex-shrink-0 text-sm'>{component.icon}</span>}
                      <div className='min-w-0 flex-1'>
                        <div className='text-xs font-medium tracking-wide'>{component.name}</div>
                        <div className='mt-0.5 line-clamp-2 text-xs text-gray-500'>{component.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
