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
    <div className={cn('w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50', className)}>
      <div className='p-6'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>Components</h2>
        <div className='space-y-6'>
          {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
            <div key={category}>
              <h3 className='mb-3 text-sm font-medium tracking-wide text-gray-500 uppercase'>{category}</h3>
              <div className='space-y-1'>
                {categoryComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => onComponentSelect(component.id)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left transition-colors duration-200',
                      'hover:bg-gray-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none',
                      selectedComponent === component.id
                        ? 'border border-purple-200 bg-purple-50 text-purple-900'
                        : 'text-gray-700 hover:text-gray-900',
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      {component.icon && <span className='mt-0.5 flex-shrink-0 text-lg'>{component.icon}</span>}
                      <div className='min-w-0 flex-1'>
                        <div className='text-sm font-medium'>{component.name}</div>
                        <div className='mt-1 line-clamp-2 text-xs text-gray-500'>{component.description}</div>
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
