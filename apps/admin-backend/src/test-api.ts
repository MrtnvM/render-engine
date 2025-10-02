#!/usr/bin/env node

/**
 * Simple API test script to validate the scenarios API endpoints
 * Run with: npx tsx src/test-api.ts
 */

import { config } from 'dotenv'

config({ path: '.env' })

const API_BASE = 'http://localhost:3050'

async function testAPI() {
  console.log('🧪 Testing Admin Backend API...\n')

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', healthData.status)

    // Test 2: Get all scenarios (empty initially)
    console.log('\n2️⃣ Testing GET /api/scenarios...')
    const scenariosResponse = await fetch(`${API_BASE}/api/scenarios`)
    const scenariosData = await scenariosResponse.json()
    console.log('✅ Scenarios fetched:', scenariosData.pagination.total, 'total scenarios')

    // Test 3: Create a test scenario
    console.log('\n3️⃣ Testing POST /api/scenarios...')
    const testScenario = {
      key: 'test-scenario-' + Date.now(),
      mainComponent: {
        type: 'container',
        style: { padding: '16px' },
        children: [
          {
            type: 'text',
            properties: { text: 'Hello World' },
            style: { fontSize: '24px' }
          }
        ]
      },
      components: {},
      version: '1.0.0',
      metadata: {
        author: 'api-test',
        description: 'Test scenario created by API test'
      }
    }

    const createResponse = await fetch(`${API_BASE}/api/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testScenario)
    })

    if (createResponse.ok) {
      const createdScenario = await createResponse.json()
      console.log('✅ Scenario created with ID:', createdScenario.id)

      // Test 4: Get scenario by ID
      console.log('\n4️⃣ Testing GET /api/scenarios/:id...')
      const getResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}`)
      if (getResponse.ok) {
        const scenarioData = await getResponse.json()
        console.log('✅ Scenario retrieved:', scenarioData.key)
      } else {
        console.log('❌ Failed to get scenario by ID')
      }

      // Test 5: Update scenario
      console.log('\n5️⃣ Testing PUT /api/scenarios/:id...')
      const updateData = {
        metadata: {
          ...testScenario.metadata,
          updated: true,
          updateTime: new Date().toISOString()
        }
      }

      const updateResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (updateResponse.ok) {
        const updatedScenario = await updateResponse.json()
        console.log('✅ Scenario updated:', updatedScenario.metadata.updated)
      } else {
        console.log('❌ Failed to update scenario')
      }

      // Test 6: Analytics view event
      console.log('\n6️⃣ Testing POST /api/scenarios/:id/analytics/view...')
      const viewAnalyticsResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}/analytics/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'test',
          userAgent: 'api-test/1.0',
          sessionId: 'test-session-123'
        })
      })

      if (viewAnalyticsResponse.ok) {
        console.log('✅ View analytics logged')
      } else {
        console.log('❌ Failed to log view analytics')
      }

      // Test 7: Analytics interaction event
      console.log('\n7️⃣ Testing POST /api/scenarios/:id/analytics/interaction...')
      const interactionAnalyticsResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}/analytics/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: 'test-button',
          interactionType: 'click',
          platform: 'test',
          sessionId: 'test-session-123'
        })
      })

      if (interactionAnalyticsResponse.ok) {
        console.log('✅ Interaction analytics logged')
      } else {
        console.log('❌ Failed to log interaction analytics')
      }

      // Test 8: Get analytics for scenario
      console.log('\n8️⃣ Testing GET /api/scenarios/:id/analytics...')
      const getAnalyticsResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}/analytics`)
      if (getAnalyticsResponse.ok) {
        const analyticsData = await getAnalyticsResponse.json()
        console.log('✅ Analytics data retrieved for scenario:', analyticsData.scenarioId)
      } else {
        console.log('❌ Failed to get analytics data')
      }

      // Test 9: Delete scenario (cleanup)
      console.log('\n9️⃣ Testing DELETE /api/scenarios/:id...')
      const deleteResponse = await fetch(`${API_BASE}/api/scenarios/${createdScenario.id}`, {
        method: 'DELETE'
      })

      if (deleteResponse.ok) {
        console.log('✅ Scenario deleted successfully')
      } else {
        console.log('❌ Failed to delete scenario')
      }
    } else {
      const errorData = await createResponse.json()
      console.log('❌ Failed to create scenario:', errorData.error)
    }

    // Test 10: Dashboard analytics
    console.log('\n🔟 Testing GET /api/analytics/dashboard...')
    const dashboardResponse = await fetch(`${API_BASE}/api/analytics/dashboard`)
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard analytics retrieved:', dashboardData.totalScenarios, 'scenarios')
    } else {
      console.log('❌ Failed to get dashboard analytics')
    }

    console.log('\n🎉 API tests completed!')

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure the server is running: npm run dev')
  }
}

// Run tests only if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI()
}

export { testAPI }