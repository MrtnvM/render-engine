import React from 'react'
import { DesignSystemLayout, ComponentItem } from '.'
import { ButtonShowcase } from './ButtonShowcase'
import { InputFieldSetShowcase } from './InputFieldSetShowcase'
import { InputShowcase } from './InputShowcase'
import { SelectFieldsetShowcase } from './SelectFieldsetShowcase'
import { SelectShowcase } from './SelectShowcase'

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
  {
    id: 'input-fieldset',
    name: 'InputFieldSet',
    description: 'Complete input field with label and status text',
    category: 'Forms',
    icon: '📋',
  },
  {
    id: 'select',
    name: 'Select',
    description: 'Dropdown select component with multiple options and states',
    category: 'Forms',
    icon: '🔽',
  },
  {
    id: 'select-fieldset',
    name: 'SelectFieldset',
    description: 'Complete select field with label and status text',
    category: 'Forms',
    icon: '📋',
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
    case 'input-fieldset':
      return <InputFieldSetShowcase />
    case 'select':
      return <SelectShowcase />
    case 'select-fieldset':
      return <SelectFieldsetShowcase />
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
