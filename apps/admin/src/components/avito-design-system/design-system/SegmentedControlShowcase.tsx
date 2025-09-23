import React from 'react'
import { SegmentedControl } from '../components/SegmentedControl'
import { cn } from '../utils/cn'

interface SegmentedControlShowcaseProps {
  className?: string
}

// Section Header Component
const SectionHeader: React.FC = () => (
  <div className='mb-8'>
    <div className='inline-flex items-center gap-2 text-purple-600'>
      <span className='text-2xl'>📊</span>
      <h1 className='text-2xl font-bold'>SegmentedControl Component</h1>
    </div>
    <p className='mt-2 text-gray-600'>
      A segmented control component for selecting one option from a set of mutually exclusive choices
    </p>
  </div>
)

// Column Header Item Component
interface ColumnHeaderItemProps {
  title: string
  subLabels?: string[]
  className?: string
  width?: string
}

const ColumnHeaderItem: React.FC<ColumnHeaderItemProps> = ({
  title,
  subLabels,
  className = 'flex-1',
  width = 'w-48',
}) => (
  <div className={`${width} ${className} border-b-2 border-gray-200 pb-2`}>
    <h3 className='text-sm font-medium text-gray-900'>{title}</h3>
    {subLabels && subLabels.length > 0 && (
      <div className='mt-1 grid grid-cols-2 gap-1'>
        {subLabels.map((label, index) => (
          <span key={index} className='text-xs text-gray-600'>
            {label}
          </span>
        ))}
      </div>
    )}
  </div>
)

// Column Headers Component
const ColumnHeaders: React.FC = () => (
  <div className='mb-6 flex gap-8 text-center'>
    <ColumnHeaderItem title='Size' className='flex-shrink-0' width='w-20' />
    <ColumnHeaderItem title='Default' />
    <ColumnHeaderItem title='Accent' />
    <ColumnHeaderItem title='Pay' />
    <ColumnHeaderItem title='Success' />
    <ColumnHeaderItem title='Danger' />
  </div>
)

// SegmentedControl Variant Group Item Component
interface SegmentedControlVariantGroupItemProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'accent' | 'pay' | 'success' | 'danger'
}

const SegmentedControlVariantGroupItem: React.FC<SegmentedControlVariantGroupItemProps> = ({ size, variantType }) => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  return (
    <div className='flex w-48 justify-center'>
      <SegmentedControl
        options={options}
        value='option2'
        onChange={() => {}}
        size={size}
        variant={variantType}
      />
    </div>
  )
}

// SegmentedControl Variant Group Component
interface SegmentedControlVariantGroupProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  variantType: 'default' | 'accent' | 'pay' | 'success' | 'danger'
}

const SegmentedControlVariantGroup: React.FC<SegmentedControlVariantGroupProps> = ({ size, variantType }) => (
  <SegmentedControlVariantGroupItem size={size} variantType={variantType} />
)

// SegmentedControl Size Row Component
interface SegmentedControlSizeRowProps {
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
}

const SegmentedControlSizeRow: React.FC<SegmentedControlSizeRowProps> = ({ size }) => (
  <div key={`rect-${size}`} className='flex items-center gap-8'>
    <div className='flex w-20 flex-shrink-0 items-center justify-center'>
      <span className='text-sm font-medium text-gray-900 uppercase'>{size}</span>
    </div>
    <SegmentedControlVariantGroup size={size} variantType='default' />
    <SegmentedControlVariantGroup size={size} variantType='accent' />
    <SegmentedControlVariantGroup size={size} variantType='pay' />
    <SegmentedControlVariantGroup size={size} variantType='success' />
    <SegmentedControlVariantGroup size={size} variantType='danger' />
  </div>
)

// SegmentedControl Variants Showcase Component
const SegmentedControlVariantsShowcase: React.FC = () => {
  const sizes = ['m', 'xl', 'l', 's', 'xs'] as const

  return (
    <div className='space-y-3'>
      {sizes.map((size) => (
        <SegmentedControlSizeRow key={`row-${size}`} size={size} />
      ))}
    </div>
  )
}

// Interactive SegmentedControl Examples Section
const InteractiveExamples: React.FC = () => {
  const [selectedValue, setSelectedValue] = React.useState('option2')

  const basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  const colorOptions = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ]

  return (
    <div className='mb-8'>
      <h2 className='mb-4 text-lg font-semibold text-gray-900'>Interactive Examples</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Basic Usage</h3>
          <div className='space-y-4'>
            <SegmentedControl
              options={basicOptions}
              value={selectedValue}
              onChange={setSelectedValue}
              size='m'
              variant='default'
            />
            <p className='text-xs text-gray-500'>Selected: {selectedValue}</p>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Color Variants</h3>
          <div className='space-y-4'>
            <SegmentedControl
              options={colorOptions}
              value='green'
              onChange={() => {}}
              size='m'
              variant='success'
            />
            <SegmentedControl
              options={colorOptions}
              value='blue'
              onChange={() => {}}
              size='m'
              variant='accent'
            />
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 p-4'>
          <h3 className='mb-2 text-sm font-medium text-gray-700'>Disabled State</h3>
          <div className='space-y-4'>
            <SegmentedControl
              options={statusOptions}
              value='active'
              onChange={() => {}}
              size='m'
              variant='default'
              disabled
            />
            <p className='text-xs text-gray-500'>All interactions disabled</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Special States Section
const SpecialStatesSection: React.FC = () => (
  <div className='mb-8'>
    <h2 className='mb-4 text-lg font-semibold text-gray-900'>Special States & Presets</h2>
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='rounded-lg border border-gray-200 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Different Sizes</h3>
        <div className='space-y-4'>
          <SegmentedControl
            options={[
              { value: 'xs', label: 'XS' },
              { value: 's', label: 'S' },
            ]}
            value='xs'
            onChange={() => {}}
            size='xs'
            variant='default'
          />
          <SegmentedControl
            options={[
              { value: 'm', label: 'M' },
              { value: 'l', label: 'L' },
            ]}
            value='m'
            onChange={() => {}}
            size='m'
            variant='accent'
          />
          <SegmentedControl
            options={[
              { value: 'xl', label: 'XL' },
              { value: 'xxl', label: 'XXL' },
            ]}
            value='xl'
            onChange={() => {}}
            size='xl'
            variant='pay'
          />
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>Overlay Preset</h3>
        <div className='space-y-4'>
          <SegmentedControl
            options={[
              { value: 'overlay1', label: 'Overlay 1' },
              { value: 'overlay2', label: 'Overlay 2' },
              { value: 'overlay3', label: 'Overlay 3' },
            ]}
            value='overlay2'
            onChange={() => {}}
            size='m'
            variant='default'
            preset='overlay'
          />
          <SegmentedControl
            options={[
              { value: 'disabled1', label: 'Disabled 1' },
              { value: 'disabled2', label: 'Disabled 2' },
            ]}
            value='disabled1'
            onChange={() => {}}
            size='m'
            variant='default'
            preset='overlay'
            disabled
          />
        </div>
      </div>
    </div>
  </div>
)

// Accessibility Section
const AccessibilitySection: React.FC = () => (
  <div className='mb-8'>
    <h2 className='mb-4 text-lg font-semibold text-gray-900'>Accessibility Features</h2>
    <div className='rounded-lg border border-gray-200 p-4'>
      <h3 className='mb-2 text-sm font-medium text-gray-700'>Keyboard Navigation</h3>
      <div className='space-y-2 text-sm text-gray-600'>
        <p>• <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>←</kbd> <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>→</kbd> Arrow keys to navigate between options</p>
        <p>• <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>Home</kbd> Jump to first option</p>
        <p>• <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>End</kbd> Jump to last option</p>
        <p>• <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>Space</kbd> or <kbd className='rounded bg-gray-100 px-1 py-0.5 text-xs'>Enter</kbd> Select focused option</p>
      </div>
      <div className='mt-4'>
        <SegmentedControl
          options={[
            { value: 'a11y1', label: 'Accessible 1' },
            { value: 'a11y2', label: 'Accessible 2' },
            { value: 'a11y3', label: 'Accessible 3' },
          ]}
          value='a11y2'
          onChange={() => {}}
          size='m'
          variant='default'
          ariaLabel='Accessibility example segmented control'
        />
      </div>
    </div>
  </div>
)

export const SegmentedControlShowcase: React.FC<SegmentedControlShowcaseProps> = ({ className }) => (
  <div className={cn('min-h-screen bg-white', className)} style={{ fontFamily: 'var(--avito-font-family)' }}>
    <div className='mx-auto max-w-7xl'>
      <SectionHeader />

      <InteractiveExamples />
      <SpecialStatesSection />
      <AccessibilitySection />

      <div className='mb-8'>
        <h2 className='mb-4 text-lg font-semibold text-gray-900'>All Variants</h2>
        <ColumnHeaders />
        <SegmentedControlVariantsShowcase />
      </div>
    </div>
  </div>
)