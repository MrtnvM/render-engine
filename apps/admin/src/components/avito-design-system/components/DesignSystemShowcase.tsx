import React from 'react'
import { DesignSystemLayout, ComponentItem } from '../design-system'
import { ButtonShowcase } from '../design-system/ButtonShowcase'
import { InputShowcase } from '../design-system/InputShowcase'

// Define available components
const components: ComponentItem[] = [
  {
    id: 'button',
    name: 'Button',
    description: 'Interactive button component with multiple variants, sizes, and states',
    category: 'Actions',
    icon: '🔘',
  },
  {
    id: 'input',
    name: 'Input',
    description: 'Text input component with validation states',
    category: 'Forms',
    icon: '📝',
  },
  // Add more components here as they are created
  // {
  //   id: 'card',
  //   name: 'Card',
  //   description: 'Container component for grouping related content',
  //   category: 'Layout',
  //   icon: '🃏',
  // },
]

// Component renderer based on selected component
const renderComponent = (selectedComponent: string | null) => {
  switch (selectedComponent) {
    case 'button':
      return <ButtonShowcase />
    case 'input':
      return <InputShowcase />
    // Add more cases as components are added
    // case 'card':
    //   return <CardShowcase />
    default:
      return null
  }
}

export const DesignSystemShowcase: React.FC = () => {
  return (
    <DesignSystemLayout components={components}>
      {(selectedComponent) => renderComponent(selectedComponent)}
    </DesignSystemLayout>
  )
}
