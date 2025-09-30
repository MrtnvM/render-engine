import { describe, it, expect } from 'vitest'
import { transpile } from '../transpiler/transpiler'

describe('SellerSection Component Transpilation', () => {
  it('should transpile SellerSection component with destructured props correctly', async () => {
    const jsxCode = `
export const SCENARIO_KEY = 'seller-section-test'

export default function SellerSection({ storeName, rating, reviewCount }: { storeName: string, rating: string, reviewCount: string }) {
  return (
    <Row style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0E6FF' }}>
      <Row style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#F0F8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: storeName }} />
        <Text style={{ fontSize: 15, fontWeight: '500', backgroundColor: '#E6F3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: rating }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#A3A3A3', backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: reviewCount }} />
      </Row>
    </Row>
  )
}
`

    const result = await transpile(jsxCode)

    // Verify scenario structure
    expect(result.key).toBe('seller-section-test')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()
    expect(result.components).toBeDefined()

    // Verify main component structure
    expect(result.main.type).toBe('Row')
    expect(result.main.style).toEqual({
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: '#F0E6FF',
    })

    // Verify children structure
    expect(result.main.children).toHaveLength(1)
    const innerRow = result.main.children![0]
    expect(innerRow.type).toBe('Row')
    expect(innerRow.style).toEqual({
      alignItems: 'center',
    })

    // Verify Text components
    expect(innerRow.children).toHaveLength(3)

    // First Text component (storeName)
    const storeNameText = innerRow.children![0]
    expect(storeNameText.type).toBe('Text')
    expect(storeNameText.style).toEqual({
      fontSize: 21,
      fontWeight: '800',
      backgroundColor: '#F0F8FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: '6px',
    })
    expect(storeNameText.properties).toEqual({
      text: { type: 'prop', key: 'storeName' },
    })

    // Second Text component (rating)
    const ratingText = innerRow.children![1]
    expect(ratingText.type).toBe('Text')
    expect(ratingText.style).toEqual({
      fontSize: 15,
      fontWeight: '500',
      backgroundColor: '#E6F3FF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: '4px',
    })
    expect(ratingText.properties).toEqual({
      text: { type: 'prop', key: 'rating' },
    })

    // Third Text component (reviewCount)
    const reviewCountText = innerRow.children![2]
    expect(reviewCountText.type).toBe('Text')
    expect(reviewCountText.style).toEqual({
      fontSize: 15,
      fontWeight: '500',
      color: '#A3A3A3',
      backgroundColor: '#F5F5F5',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: '4px',
    })
    expect(reviewCountText.properties).toEqual({
      text: { type: 'prop', key: 'reviewCount' },
    })
  })

  it('should handle SellerSection with commented out elements', async () => {
    const jsxCode = `
export const SCENARIO_KEY = 'seller-section-with-comments'

export default function SellerSection({ storeName, rating, reviewCount }: { storeName: string, rating: string, reviewCount: string }) {
  return (
    <Row style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0E6FF' }}>
      {/* <Checkbox style={{ backgroundColor: '#F0F8FF', borderRadius: '4px', padding: 4 }} properties={{ checked: checked, disabled: false }} /> */}
      <Row style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#F0F8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: storeName }} />
        {/* <Rating style={{ backgroundColor: '#FFF8DC', borderRadius: '6px', padding: 4 }} properties={{ rating: rating, maxRating: 5, interactive: false }} /> */}
        <Text style={{ fontSize: 15, fontWeight: '500', backgroundColor: '#E6F3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: rating }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#A3A3A3', backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: reviewCount }} />
      </Row>
    </Row>
  )
}
`

    const result = await transpile(jsxCode)

    // Verify scenario structure
    expect(result.key).toBe('seller-section-with-comments')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()

    // Verify main component structure (should be the same as without comments)
    expect(result.main.type).toBe('Row')
    expect(result.main.style).toEqual({
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: '#F0E6FF',
    })

    // Verify children structure (should ignore comments)
    expect(result.main.children).toHaveLength(1)
    const innerRow = result.main.children![0]
    expect(innerRow.type).toBe('Row')
    expect(innerRow.children).toHaveLength(3) // Only the Text components, not the commented elements
  })

  it('should handle SellerSection with mixed literal and prop values', async () => {
    const jsxCode = `
export const SCENARIO_KEY = 'seller-section-mixed-values'

export default function SellerSection({ storeName, rating, reviewCount }: { storeName: string, rating: string, reviewCount: string }) {
  return (
    <Row style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0E6FF' }}>
      <Row style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#F0F8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: 'Store: ' + storeName }} />
        <Text style={{ fontSize: 15, fontWeight: '500', backgroundColor: '#E6F3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: rating }} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#A3A3A3', backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: '4px' }} properties={{ text: reviewCount }} />
      </Row>
    </Row>
  )
}
`

    const result = await transpile(jsxCode)

    // Verify scenario structure
    expect(result.key).toBe('seller-section-mixed-values')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()

    // Verify first Text component has expression that couldn't be resolved (returns null)
    const innerRow = result.main.children![0]
    const storeNameText = innerRow.children![0]
    expect(storeNameText.properties).toEqual({
      text: null, // The expression 'Store: ' + storeName cannot be resolved at transpile time
    })
  })

  it('should handle SellerSection with simple inline styles', async () => {
    const jsxCode = `
export const SCENARIO_KEY = 'seller-section-simple-styles'

export default function SellerSection({ storeName, rating, reviewCount }: { storeName: string, rating: string, reviewCount: string }) {
  return (
    <Row style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#F0E6FF' }}>
      <Row style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 21, fontWeight: '800', backgroundColor: '#F0F8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: '6px' }} properties={{ text: storeName }} />
      </Row>
    </Row>
  )
}
`

    const result = await transpile(jsxCode)

    // Verify scenario structure
    expect(result.key).toBe('seller-section-simple-styles')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()

    // Verify main component structure
    expect(result.main.type).toBe('Row')
    expect(result.main.style).toEqual({
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: '#F0E6FF',
    })

    // Verify children structure
    expect(result.main.children).toHaveLength(1)
    const innerRow = result.main.children![0]
    expect(innerRow.type).toBe('Row')
    expect(innerRow.style).toEqual({
      alignItems: 'center',
    })

    // Verify Text component
    expect(innerRow.children).toHaveLength(1)
    const storeNameText = innerRow.children![0]
    expect(storeNameText.type).toBe('Text')
    expect(storeNameText.style).toEqual({
      fontSize: 21,
      fontWeight: '800',
      backgroundColor: '#F0F8FF',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: '6px',
    })
    expect(storeNameText.properties).toEqual({
      text: { type: 'prop', key: 'storeName' },
    })
  })
})
