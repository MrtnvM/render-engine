import React, { useState } from 'react'
import { cn } from '../utils/cn'
import { ComponentList, ComponentItem } from './ComponentList'
import { ComponentShowcase } from './ComponentShowcase'

interface DesignSystemLayoutProps {
  components: ComponentItem[]
  children: (selectedComponent: string | null) => React.ReactNode
  className?: string
}

export const DesignSystemLayout: React.FC<DesignSystemLayoutProps> = ({ components, children, className }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const handleComponentSelect = (componentId: string) => {
    setSelectedComponent(componentId)
  }

  return (
    <div className={cn('flex min-h-screen bg-white', className)}>
      <ComponentList
        components={components}
        selectedComponent={selectedComponent}
        onComponentSelect={handleComponentSelect}
      />
      <ComponentShowcase selectedComponent={selectedComponent}>{children(selectedComponent)}</ComponentShowcase>
    </div>
  )
}
