import { describe, it, expect } from 'vitest'
import type { HandlerActionDescriptor, StoreActionDescriptor } from '../../src/runtime/action-types'
import { transpile } from '../../src/transpiler/transpiler'

function findHandlerAction(actions: any[] | undefined, id: string): HandlerActionDescriptor | undefined {
  return (actions || []).find(
    (action: HandlerActionDescriptor | StoreActionDescriptor): action is HandlerActionDescriptor =>
      action.kind === 'handler' && action.id === id,
  )
}

function getStoreActions(actions: any[] | undefined): StoreActionDescriptor[] {
  return (actions || []).filter((action): action is StoreActionDescriptor => action.kind === 'store')
}

describe('JSX handler serialization', () => {
  it('serializes handler bodies and associates store operations', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { Button } from '../ui'

      export const SCENARIO = { key: "handler-scenario", name: "Handler Scenario", description: "Test", version: "1.0.0" }

      const counterStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        return (
          <Button
            title="Increment"
            onPress={() => {
              let value = -1
              if (value === -1) {
                value = value + 2
              } else {
                value = value - 2
              }
              for (let i = 0; i < 3; i++) {
                value = value + i
              }
              while (value < 10) {
                value++
              }
              counterStore.set('count', value)
            }}
          />
        )
      }
    `

    const result = await transpile(code)

    const onPressId = result.main?.data?.onPress
    expect(typeof onPressId).toBe('string')
    expect(onPressId).toMatch(/^action_\d+$/)

    const handlerAction = findHandlerAction(result.actions, onPressId!)
    expect(handlerAction).toBeDefined()
    expect(handlerAction!.handler.body.type).toBe('BlockStatement')

    const block = handlerAction!.handler.body
    if (block.type !== 'BlockStatement') {
      throw new Error('Expected BlockStatement body')
    }

    const [decl, ifStmt, forStmt, whileStmt, callStmt] = block.body
    expect(decl.type).toBe('VariableDeclaration')
    if (decl.type === 'VariableDeclaration') {
      expect(decl.declarations[0].init?.type).toBe('UnaryExpression')
    }

    expect(ifStmt.type).toBe('IfStatement')
    if (ifStmt.type === 'IfStatement') {
      expect(ifStmt.test.type).toBe('BinaryExpression')
      expect(ifStmt.consequent.type).toBe('BlockStatement')
      expect(ifStmt.alternate?.type).toBe('BlockStatement')
    }

    expect(forStmt.type).toBe('ForStatement')
    if (forStmt.type === 'ForStatement') {
      if (forStmt.init && 'type' in forStmt.init) {
        expect(forStmt.init.type).toBe('VariableDeclaration')
      }
      expect(forStmt.test?.type).toBe('BinaryExpression')
      expect(forStmt.update?.type).toBe('UpdateExpression')
    }

    expect(whileStmt.type).toBe('WhileStatement')
    if (whileStmt.type === 'WhileStatement') {
      expect(whileStmt.test.type).toBe('BinaryExpression')
      expect(whileStmt.body.type).toBe('BlockStatement')
    }

    expect(callStmt.type).toBe('ExpressionStatement')
    if (callStmt.type === 'ExpressionStatement') {
      expect(callStmt.expression.type).toBe('CallExpression')
      const callExpr = callStmt.expression
      if (callExpr.type === 'CallExpression') {
        expect(callExpr.callee.type).toBe('MemberExpression')
      }
    }

    const storeActions = getStoreActions(result.actions)
    expect(storeActions).toHaveLength(1)
    expect(storeActions[0].handlerId).toBe(onPressId)
    expect(handlerAction!.linkedActionIds).toEqual([storeActions[0].id])
  })
})
