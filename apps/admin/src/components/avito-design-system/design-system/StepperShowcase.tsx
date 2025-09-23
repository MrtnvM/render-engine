import React, { useState } from 'react'
import { Stepper } from '../components/Stepper'

export const StepperShowcase: React.FC = () => {
  const [controlledValue, setControlledValue] = useState(5)
  const [loadingValue, setLoadingValue] = useState(3)

  const handleLoadingDemo = () => {
    setLoadingValue(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Stepper Component</h2>
        <p className="text-gray-600">
          The Stepper component is a quantity selector interface element that allows users to increment and decrement values through intuitive plus and minus controls. 
          It supports multiple sizes, presets, and states with comprehensive accessibility features.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Best Practices</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Use for quantity selection in forms, shopping carts, and configuration interfaces</li>
            <li>• Provide clear min/max values to prevent invalid inputs</li>
            <li>• Use loading state during async operations</li>
            <li>• Show error states with descriptive messages</li>
            <li>• Consider using overlay preset in modals and popups</li>
          </ul>
        </div>
      </div>

      {/* Interactive Example */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Interactive Example</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Controlled:</label>
            <Stepper
              value={controlledValue}
              onChange={setControlledValue}
              min={0}
              max={10}
              step={1}
            />
            <span className="text-sm text-gray-600">Value: {controlledValue}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Loading Demo:</label>
            <Stepper
              value={loadingValue}
              onChange={setLoadingValue}
              state="loading"
              min={0}
              max={10}
            />
            <button
              onClick={handleLoadingDemo}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Trigger Loading
            </button>
          </div>
        </div>
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Size Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Small (S)</h4>
            <Stepper size="s" value={2} />
            <p className="text-xs text-gray-500">36px height, 12px border radius</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Medium (M)</h4>
            <Stepper size="m" value={5} />
            <p className="text-xs text-gray-500">44px height, 12px border radius</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Large (L)</h4>
            <Stepper size="l" value={8} />
            <p className="text-xs text-gray-500">52px height, 16px border radius</p>
          </div>
        </div>
      </div>

      {/* State Variants */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">State Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Default</h4>
            <Stepper value={3} />
            <p className="text-xs text-gray-500">Standard appearance</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Active</h4>
            <Stepper value={3} state="active" />
            <p className="text-xs text-gray-500">With focus ring and cursor</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Focus</h4>
            <Stepper value={3} state="focus" />
            <p className="text-xs text-gray-500">Keyboard navigation focus</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Loading</h4>
            <Stepper value={3} state="loading" />
            <p className="text-xs text-gray-500">With spinner animation</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">+ Disabled</h4>
            <Stepper value={3} state="plus-disabled" />
            <p className="text-xs text-gray-500">Add button disabled</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">- Disabled</h4>
            <Stepper value={3} state="minus-disabled" />
            <p className="text-xs text-gray-500">Minus button disabled</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Disabled</h4>
            <Stepper value={3} state="disabled" />
            <p className="text-xs text-gray-500">Fully disabled</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Error</h4>
            <Stepper value={3} state="error" errorMessage="Ошибка" />
            <p className="text-xs text-gray-500">With error message</p>
          </div>
        </div>
      </div>

      {/* Preset Variants */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Preset Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Default</h4>
            <Stepper value={3} preset="default" />
            <p className="text-xs text-gray-500">Light gray background (#F2F1F0)</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Overlay</h4>
            <Stepper value={3} preset="overlay" />
            <p className="text-xs text-gray-500">White background for overlays</p>
          </div>
        </div>
      </div>

      {/* Complete Matrix */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Complete Variant Matrix</h3>
        <div className="space-y-6">
          {/* Default Preset */}
          <div className="space-y-3">
            <h4 className="font-medium text-lg">Default Preset</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Small (S)</h5>
                <div className="space-y-2">
                  <Stepper size="s" value={1} state="default" />
                  <Stepper size="s" value={1} state="active" />
                  <Stepper size="s" value={1} state="focus" />
                  <Stepper size="s" value={1} state="loading" />
                  <Stepper size="s" value={1} state="plus-disabled" />
                  <Stepper size="s" value={1} state="minus-disabled" />
                  <Stepper size="s" value={1} state="disabled" />
                  <Stepper size="s" value={1} state="error" errorMessage="Ошибка" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Medium (M)</h5>
                <div className="space-y-2">
                  <Stepper size="m" value={3} state="default" />
                  <Stepper size="m" value={3} state="active" />
                  <Stepper size="m" value={3} state="focus" />
                  <Stepper size="m" value={3} state="loading" />
                  <Stepper size="m" value={3} state="plus-disabled" />
                  <Stepper size="m" value={3} state="minus-disabled" />
                  <Stepper size="m" value={3} state="disabled" />
                  <Stepper size="m" value={3} state="error" errorMessage="Ошибка" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Large (L)</h5>
                <div className="space-y-2">
                  <Stepper size="l" value={5} state="default" />
                  <Stepper size="l" value={5} state="active" />
                  <Stepper size="l" value={5} state="focus" />
                  <Stepper size="l" value={5} state="loading" />
                  <Stepper size="l" value={5} state="plus-disabled" />
                  <Stepper size="l" value={5} state="minus-disabled" />
                  <Stepper size="l" value={5} state="disabled" />
                  <Stepper size="l" value={5} state="error" errorMessage="Ошибка" />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Preset */}
          <div className="space-y-3">
            <h4 className="font-medium text-lg">Overlay Preset</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Small (S)</h5>
                <div className="space-y-2">
                  <Stepper size="s" value={1} preset="overlay" state="default" />
                  <Stepper size="s" value={1} preset="overlay" state="active" />
                  <Stepper size="s" value={1} preset="overlay" state="focus" />
                  <Stepper size="s" value={1} preset="overlay" state="loading" />
                  <Stepper size="s" value={1} preset="overlay" state="plus-disabled" />
                  <Stepper size="s" value={1} preset="overlay" state="minus-disabled" />
                  <Stepper size="s" value={1} preset="overlay" state="disabled" />
                  <Stepper size="s" value={1} preset="overlay" state="error" errorMessage="Ошибка" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Medium (M)</h5>
                <div className="space-y-2">
                  <Stepper size="m" value={3} preset="overlay" state="default" />
                  <Stepper size="m" value={3} preset="overlay" state="active" />
                  <Stepper size="m" value={3} preset="overlay" state="focus" />
                  <Stepper size="m" value={3} preset="overlay" state="loading" />
                  <Stepper size="m" value={3} preset="overlay" state="plus-disabled" />
                  <Stepper size="m" value={3} preset="overlay" state="minus-disabled" />
                  <Stepper size="m" value={3} preset="overlay" state="disabled" />
                  <Stepper size="m" value={3} preset="overlay" state="error" errorMessage="Ошибка" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Large (L)</h5>
                <div className="space-y-2">
                  <Stepper size="l" value={5} preset="overlay" state="default" />
                  <Stepper size="l" value={5} preset="overlay" state="active" />
                  <Stepper size="l" value={5} preset="overlay" state="focus" />
                  <Stepper size="l" value={5} preset="overlay" state="loading" />
                  <Stepper size="l" value={5} preset="overlay" state="plus-disabled" />
                  <Stepper size="l" value={5} preset="overlay" state="minus-disabled" />
                  <Stepper size="l" value={5} preset="overlay" state="disabled" />
                  <Stepper size="l" value={5} preset="overlay" state="error" errorMessage="Ошибка" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Accessibility Features</h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <ul className="text-green-800 space-y-2 text-sm">
            <li>• <strong>Keyboard Navigation:</strong> Arrow keys (↑/↓) for increment/decrement</li>
            <li>• <strong>Screen Reader Support:</strong> Proper ARIA labels and roles</li>
            <li>• <strong>Focus Management:</strong> Clear focus indicators</li>
            <li>• <strong>Touch Targets:</strong> Minimum 44pt touch targets (iOS guidelines)</li>
            <li>• <strong>High Contrast:</strong> Meets WCAG AA standards</li>
            <li>• <strong>Disabled States:</strong> Clear visual feedback for disabled controls</li>
          </ul>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usage Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Usage</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Stepper
  value={quantity}
  onChange={setQuantity}
  min={0}
  max={10}
  step={1}
/>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">With Error State</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Stepper
  value={quantity}
  onChange={setQuantity}
  state="error"
  errorMessage="Quantity must be between 1 and 10"
  min={1}
  max={10}
/>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Loading State</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Stepper
  value={quantity}
  onChange={setQuantity}
  state="loading"
  min={0}
  max={10}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}