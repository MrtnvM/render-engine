/**
 * Action Handler Analyzer Plugin
 *
 * Analyzes JavaScript event handler functions and converts them to
 * declarative action descriptors that can be executed natively on mobile platforms.
 */

import type { File, Node } from '@babel/types'
import type { NodePath, Visitor } from '@babel/traverse'
import type { TranspilerConfig } from '../types.js'
import type {
  ActionDescriptor,
  StoreSetAction,
  StoreRemoveAction,
  StoreMergeAction,
  StoreTransactionAction,
  SequenceAction,
  ConditionalAction,
  NavigationPushAction,
  NavigationPopAction,
  NavigationReplaceAction,
  NavigationModalAction,
  ShowToastAction,
  ShowAlertAction,
  ShowSheetAction,
  ShareAction,
  OpenUrlAction,
  HapticAction,
  ApiRequestAction,
} from '../../runtime/declarative-action-types.js'
import type {
  ValueDescriptor,
  ConditionDescriptor,
  StoreReference,
  LiteralValue,
} from '../../runtime/value-descriptors.js'
import { TranspilerPlugin } from './base-plugin.js'
import {
  createExternalVariableError,
  createAsyncHandlerError,
  createComplexLoopError,
  createUnsupportedStatementError,
  createUnsupportedExpressionError,
  createInvalidStoreOperationError,
  createInvalidConditionError,
} from '../errors.js'
import * as t from '@babel/types'

export interface ActionHandlerAnalyzerResult {
  actionHandlers: Map<string, ActionDescriptor>
  handlerIdByFunction: Map<Node, string>
}

/**
 * Analyzes handler functions and converts them to declarative actions
 */
export class ActionHandlerAnalyzerPlugin extends TranspilerPlugin<ActionHandlerAnalyzerResult> {
  private actionHandlers: Map<string, ActionDescriptor> = new Map()
  private handlerIdByFunction: Map<Node, string> = new Map()
  private actionIdCounter = 0
  private storeVarToConfig: Map<string, StoreReference>

  // Track local variable declarations within handlers
  private localVariables: Set<string> = new Set()

  constructor(storeVarToConfig: Map<string, StoreReference>, config?: TranspilerConfig) {
    super(config)
    this.storeVarToConfig = storeVarToConfig
  }

  protected getVisitors(): Visitor {
    return {
      // Detect arrow functions and function expressions used as event handlers
      ArrowFunctionExpression: (path: NodePath<t.ArrowFunctionExpression>) => {
        // Only analyze if it's used as a prop value (event handler)
        if (this.isEventHandlerContext(path)) {
          this.analyzeHandler(path.node, path)
        }
      },

      FunctionExpression: (path: NodePath<t.FunctionExpression>) => {
        // Only analyze if it's used as a prop value (event handler)
        if (this.isEventHandlerContext(path)) {
          this.analyzeHandler(path.node, path)
        }
      },
    }
  }

  protected afterTraverse(ast: File, state: any): ActionHandlerAnalyzerResult {
    return {
      actionHandlers: this.actionHandlers,
      handlerIdByFunction: this.handlerIdByFunction,
    }
  }

  /**
   * Check if function is used in an event handler context
   */
  private isEventHandlerContext(path: NodePath<t.Function>): boolean {
    const parent = path.parent
    // Check if it's a JSX attribute value (e.g., onPress={...})
    if (t.isJSXExpressionContainer(parent)) {
      const grandParent = path.parentPath?.parent
      if (t.isJSXAttribute(grandParent)) {
        const attrName = t.isJSXIdentifier(grandParent.name) ? grandParent.name.name : ''
        // Common event handler names
        return /^on[A-Z]/.test(attrName) // onPress, onChange, onClick, etc.
      }
    }
    return false
  }

  /**
   * Analyze a handler function and convert to action descriptor
   */
  private analyzeHandler(node: t.ArrowFunctionExpression | t.FunctionExpression, path: NodePath<t.Function>): void {
    try {
      // Validate handler (no async, etc.)
      this.validateHandler(node, path)

      // Generate unique action ID
      const actionId = this.generateActionId()

      // Track function params as local variables
      this.localVariables.clear()
      node.params.forEach((param) => {
        if (t.isIdentifier(param)) {
          this.localVariables.add(param.name)
        }
      })

      // Analyze handler body
      const action = this.analyzeHandlerBody(node.body, path)

      // Store action and associate with function node
      if (action) {
        const actionWithId: ActionDescriptor = { ...action, id: actionId }
        this.actionHandlers.set(actionId, actionWithId)
        this.handlerIdByFunction.set(node, actionId)
      }
    } catch (error) {
      // Log error but don't fail transpilation for now
      console.error('Handler analysis failed:', error)
      throw error
    }
  }

  /**
   * Validate that handler meets requirements
   */
  private validateHandler(node: t.ArrowFunctionExpression | t.FunctionExpression, path: NodePath<t.Function>): void {
    // Check for async
    if (node.async) {
      throw createAsyncHandlerError(node)
    }

    // Check for generator
    if (node.generator) {
      throw createUnsupportedStatementError('generator function', node)
    }
  }

  /**
   * Analyze handler body and convert to action
   */
  private analyzeHandlerBody(
    body: t.BlockStatement | t.Expression,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    // Single expression (arrow function without block)
    if (!t.isBlockStatement(body)) {
      return this.analyzeExpression(body, path)
    }

    // Block statement
    const statements = body.body
    if (statements.length === 0) {
      return null
    }

    // Single statement
    if (statements.length === 1) {
      return this.analyzeStatement(statements[0], path)
    }

    // Multiple statements - create sequence
    const actions: ActionDescriptor[] = []
    for (const stmt of statements) {
      const action = this.analyzeStatement(stmt, path)
      if (action) {
        actions.push(action)
      }
    }

    if (actions.length === 0) {
      return null
    }

    if (actions.length === 1) {
      return actions[0]
    }

    return {
      id: this.generateActionId(),
      kind: 'sequence',
      actions,
      strategy: 'serial',
      stopOnError: true,
    } as SequenceAction
  }

  /**
   * Analyze a single statement
   */
  private analyzeStatement(stmt: t.Statement, path: NodePath<t.Function>): ActionDescriptor | null {
    // Expression statement (most common)
    if (t.isExpressionStatement(stmt)) {
      return this.analyzeExpression(stmt.expression, path)
    }

    // If statement
    if (t.isIfStatement(stmt)) {
      return this.analyzeConditional(stmt, path)
    }

    // Variable declaration (const x = ...)
    if (t.isVariableDeclaration(stmt)) {
      return this.analyzeVariableDeclaration(stmt, path)
    }

    // Return statement
    if (t.isReturnStatement(stmt)) {
      if (stmt.argument) {
        return this.analyzeExpression(stmt.argument, path)
      }
      return null
    }

    // Block statement (nested)
    if (t.isBlockStatement(stmt)) {
      return this.analyzeHandlerBody(stmt, path)
    }

    // Unsupported
    throw createUnsupportedStatementError(stmt.type, stmt)
  }

  /**
   * Analyze an expression and convert to action
   */
  private analyzeExpression(expr: t.Expression, path: NodePath<t.Function>): ActionDescriptor | null {
    // Call expression - could be store operation, navigation, etc.
    if (t.isCallExpression(expr)) {
      return this.analyzeCallExpression(expr, path)
    }

    // Member expression - just reading a value (no action)
    if (t.isMemberExpression(expr)) {
      return null
    }

    // Binary/logical expressions
    if (t.isBinaryExpression(expr) || t.isLogicalExpression(expr)) {
      // These are used in conditions, not as standalone actions
      return null
    }

    // Literals
    if (t.isLiteral(expr)) {
      return null
    }

    // Identifier
    if (t.isIdentifier(expr)) {
      return null
    }

    return null
  }

  /**
   * Analyze a call expression (function call)
   */
  private analyzeCallExpression(expr: t.CallExpression, path: NodePath<t.Function>): ActionDescriptor | null {
    // Check for store operations: store.set(), store.get(), etc.
    if (t.isMemberExpression(expr.callee)) {
      const object = expr.callee.object
      const property = expr.callee.property

      if (t.isIdentifier(object) && t.isIdentifier(property)) {
        const varName = object.name
        const methodName = property.name

        // Check if this is a store variable
        if (this.storeVarToConfig.has(varName)) {
          const storeRef = this.storeVarToConfig.get(varName)!
          return this.analyzeStoreOperation(storeRef, methodName, expr.arguments, path)
        }

        // Check for namespace actions: navigate.push(), ui.showToast(), system.share(), api.request()
        if (varName === 'navigate') {
          return this.analyzeNavigationAction(methodName, expr.arguments, path)
        }
        if (varName === 'ui') {
          return this.analyzeUIAction(methodName, expr.arguments, path)
        }
        if (varName === 'system') {
          return this.analyzeSystemAction(methodName, expr.arguments, path)
        }
        if (varName === 'api') {
          return this.analyzeApiAction(methodName, expr.arguments, path)
        }
      }
    }

    // Check for direct function calls: share(), openUrl(), haptic()
    if (t.isIdentifier(expr.callee)) {
      const functionName = expr.callee.name

      // Navigation functions
      if (['push', 'pop', 'replace', 'modal', 'dismissModal', 'popTo', 'reset'].includes(functionName)) {
        return this.analyzeNavigationAction(functionName, expr.arguments, path)
      }

      // UI functions
      if (['showToast', 'showAlert', 'showSheet', 'dismissSheet', 'showLoading', 'hideLoading'].includes(functionName)) {
        return this.analyzeUIAction(functionName, expr.arguments, path)
      }

      // System functions
      if (['share', 'openUrl', 'haptic', 'copyToClipboard', 'requestCameraPermission', 'requestPhotoLibraryPermission', 'requestLocationPermission', 'requestNotificationPermission'].includes(functionName)) {
        return this.analyzeSystemAction(functionName, expr.arguments, path)
      }

      // API functions
      if (functionName === 'apiRequest') {
        return this.analyzeApiAction('request', expr.arguments, path)
      }

      // Unknown function - ignore for now
      return null
    }

    return null
  }

  /**
   * Analyze store operation (set, get, remove, merge, transaction)
   */
  private analyzeStoreOperation(
    storeRef: StoreReference,
    method: string,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    switch (method) {
      case 'set':
        return this.analyzeStoreSet(storeRef, args, path)
      case 'remove':
        return this.analyzeStoreRemove(storeRef, args, path)
      case 'merge':
        return this.analyzeStoreMerge(storeRef, args, path)
      case 'transaction':
        return this.analyzeStoreTransaction(storeRef, args, path)
      case 'get':
        // get() is not an action, it's used in conditions/expressions
        return null
      default:
        throw createInvalidStoreOperationError(`Unknown store method: ${method}`, args[0] as Node)
    }
  }

  /**
   * Analyze store.set() operation
   */
  private analyzeStoreSet(
    storeRef: StoreReference,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): StoreSetAction {
    if (args.length < 2) {
      throw createInvalidStoreOperationError('store.set() requires 2 arguments: keyPath and value', args[0] as Node)
    }

    const keyPathArg = args[0]
    const valueArg = args[1]

    if (t.isSpreadElement(keyPathArg) || t.isArgumentPlaceholder(keyPathArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in keyPath', keyPathArg)
    }

    if (t.isSpreadElement(valueArg) || t.isArgumentPlaceholder(valueArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in value', valueArg)
    }

    const keyPath = this.extractKeyPath(keyPathArg)
    const value = this.analyzeValue(valueArg, path)

    return {
      id: this.generateActionId(),
      kind: 'store.set',
      storeRef,
      keyPath,
      value,
    }
  }

  /**
   * Analyze store.remove() operation
   */
  private analyzeStoreRemove(
    storeRef: StoreReference,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): StoreRemoveAction {
    if (args.length < 1) {
      throw createInvalidStoreOperationError('store.remove() requires 1 argument: keyPath', args[0] as Node)
    }

    const keyPathArg = args[0]
    if (t.isSpreadElement(keyPathArg) || t.isArgumentPlaceholder(keyPathArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in keyPath', keyPathArg)
    }

    const keyPath = this.extractKeyPath(keyPathArg)

    return {
      id: this.generateActionId(),
      kind: 'store.remove',
      storeRef,
      keyPath,
    }
  }

  /**
   * Analyze store.merge() operation
   */
  private analyzeStoreMerge(
    storeRef: StoreReference,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): StoreMergeAction {
    if (args.length < 2) {
      throw createInvalidStoreOperationError('store.merge() requires 2 arguments: keyPath and value', args[0] as Node)
    }

    const keyPathArg = args[0]
    const valueArg = args[1]

    if (t.isSpreadElement(keyPathArg) || t.isArgumentPlaceholder(keyPathArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in keyPath', keyPathArg)
    }

    if (t.isSpreadElement(valueArg) || t.isArgumentPlaceholder(valueArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in value', valueArg)
    }

    const keyPath = this.extractKeyPath(keyPathArg)
    const value = this.analyzeValue(valueArg, path)

    return {
      id: this.generateActionId(),
      kind: 'store.merge',
      storeRef,
      keyPath,
      value,
    }
  }

  /**
   * Analyze store.transaction() operation
   */
  private analyzeStoreTransaction(
    storeRef: StoreReference,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): StoreTransactionAction {
    if (args.length < 1) {
      throw createInvalidStoreOperationError('store.transaction() requires a callback function', args[0] as Node)
    }

    const callbackArg = args[0]
    if (t.isSpreadElement(callbackArg) || t.isArgumentPlaceholder(callbackArg)) {
      throw createInvalidStoreOperationError('Spread elements not supported in callback', callbackArg)
    }

    if (!t.isArrowFunctionExpression(callbackArg) && !t.isFunctionExpression(callbackArg)) {
      throw createInvalidStoreOperationError(
        'store.transaction() requires a function callback',
        callbackArg as Node,
      )
    }

    // Temporarily register callback parameter as referring to the same store
    const callbackParam = callbackArg.params[0]
    let callbackParamName: string | null = null
    if (callbackParam && t.isIdentifier(callbackParam)) {
      callbackParamName = callbackParam.name
      this.storeVarToConfig.set(callbackParamName, storeRef)
    }

    // Analyze transaction body
    const transactionAction = this.analyzeHandlerBody(callbackArg.body, path)

    // Remove callback parameter from store mapping
    if (callbackParamName) {
      this.storeVarToConfig.delete(callbackParamName)
    }

    if (!transactionAction) {
      throw createInvalidStoreOperationError('Transaction callback must contain actions', callbackArg)
    }

    // Extract actions from sequence or wrap single action
    let actions: ActionDescriptor[] = []
    if (transactionAction.kind === 'sequence') {
      actions = (transactionAction as SequenceAction).actions
    } else {
      actions = [transactionAction]
    }

    // Filter only store actions
    const storeActions = actions.filter((a) => a.kind.startsWith('store.'))

    return {
      id: this.generateActionId(),
      kind: 'store.transaction',
      storeRef,
      actions: storeActions as any[], // Type assertion needed
    }
  }

  /**
   * Analyze conditional (if statement)
   */
  private analyzeConditional(stmt: t.IfStatement, path: NodePath<t.Function>): ConditionalAction {
    const condition = this.analyzeCondition(stmt.test, path)
    const thenAction = this.analyzeStatement(stmt.consequent, path)
    const elseAction = stmt.alternate ? this.analyzeStatement(stmt.alternate, path) : null

    const thenActions = thenAction ? [thenAction] : []
    const elseActions = elseAction ? [elseAction] : undefined

    return {
      id: this.generateActionId(),
      kind: 'conditional',
      condition,
      then: thenActions,
      else: elseActions,
    }
  }

  /**
   * Analyze variable declaration
   */
  private analyzeVariableDeclaration(
    decl: t.VariableDeclaration,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    // Track local variables
    for (const declarator of decl.declarations) {
      if (t.isIdentifier(declarator.id)) {
        this.localVariables.add(declarator.id.name)
      }
    }

    // Variable declarations themselves are not actions
    // They're just used for intermediate computation
    return null
  }

  /**
   * Analyze a condition expression
   */
  private analyzeCondition(test: t.Expression, path: NodePath<t.Function>): ConditionDescriptor {
    // Binary expression: ===, !==, >, <, etc.
    if (t.isBinaryExpression(test)) {
      return this.analyzeBinaryCondition(test, path)
    }

    // Logical expression: &&, ||
    if (t.isLogicalExpression(test)) {
      return this.analyzeLogicalCondition(test, path)
    }

    // Unary expression: !
    if (t.isUnaryExpression(test) && test.operator === '!') {
      return {
        type: 'not',
        conditions: [this.analyzeCondition(test.argument as t.Expression, path)],
      }
    }

    // Call expression: .includes(), .startsWith(), etc.
    if (t.isCallExpression(test)) {
      return this.analyzeCallCondition(test, path)
    }

    throw createInvalidConditionError(`Unsupported condition type: ${test.type}`, test)
  }

  /**
   * Analyze binary condition (===, !==, >, <, etc.)
   */
  private analyzeBinaryCondition(expr: t.BinaryExpression, path: NodePath<t.Function>): ConditionDescriptor {
    const left = this.analyzeValue(expr.left as t.Expression, path)
    const right = this.analyzeValue(expr.right, path)

    const operatorMap: Record<string, string> = {
      '===': 'equals',
      '==': 'equals',
      '!==': 'notEquals',
      '!=': 'notEquals',
      '>': 'greaterThan',
      '>=': 'greaterThanOrEqual',
      '<': 'lessThan',
      '<=': 'lessThanOrEqual',
    }

    const conditionType = operatorMap[expr.operator]
    if (!conditionType) {
      throw createInvalidConditionError(`Unsupported comparison operator: ${expr.operator}`, expr)
    }

    return {
      type: conditionType as any,
      left,
      right,
    }
  }

  /**
   * Analyze logical condition (&&, ||)
   */
  private analyzeLogicalCondition(expr: t.LogicalExpression, path: NodePath<t.Function>): ConditionDescriptor {
    const left = this.analyzeCondition(expr.left as t.Expression, path)
    const right = this.analyzeCondition(expr.right as t.Expression, path)

    if (expr.operator === '&&') {
      return { type: 'and', conditions: [left, right] }
    } else if (expr.operator === '||') {
      return { type: 'or', conditions: [left, right] }
    }

    throw createInvalidConditionError(`Unsupported logical operator: ${expr.operator}`, expr)
  }

  /**
   * Analyze call expression as condition (.includes(), etc.)
   */
  private analyzeCallCondition(expr: t.CallExpression, path: NodePath<t.Function>): ConditionDescriptor {
    if (t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property)) {
      const method = expr.callee.property.name
      const object = this.analyzeValue(expr.callee.object as t.Expression, path)
      const arg = expr.arguments[0]

      if (method === 'includes' && arg && !t.isSpreadElement(arg) && !t.isArgumentPlaceholder(arg)) {
        const value = this.analyzeValue(arg, path)
        return { type: 'contains', left: object, right: value }
      }

      if (method === 'startsWith' && arg && !t.isSpreadElement(arg) && !t.isArgumentPlaceholder(arg)) {
        const value = this.analyzeValue(arg, path)
        return { type: 'startsWith', left: object, right: value }
      }

      if (method === 'endsWith' && arg && !t.isSpreadElement(arg) && !t.isArgumentPlaceholder(arg)) {
        const value = this.analyzeValue(arg, path)
        return { type: 'endsWith', left: object, right: value }
      }
    }

    throw createInvalidConditionError(`Unsupported condition method call`, expr)
  }

  /**
   * Analyze a value expression and convert to ValueDescriptor
   */
  private analyzeValue(expr: t.Expression, path: NodePath<t.Function>): ValueDescriptor {
    // Literal values
    if (t.isStringLiteral(expr)) {
      return { kind: 'literal', type: 'string', value: expr.value }
    }
    if (t.isNumericLiteral(expr)) {
      return {
        kind: 'literal',
        type: Number.isInteger(expr.value) ? 'integer' : 'number',
        value: expr.value,
      }
    }
    if (t.isBooleanLiteral(expr)) {
      return { kind: 'literal', type: 'bool', value: expr.value }
    }
    if (t.isNullLiteral(expr)) {
      return { kind: 'literal', type: 'null', value: null }
    }

    // Array literal
    if (t.isArrayExpression(expr)) {
      const elements = expr.elements
        .filter((el): el is t.Expression => el !== null && !t.isSpreadElement(el))
        .map((el) => this.analyzeValue(el, path))
      return { kind: 'literal', type: 'array', value: elements as LiteralValue[] }
    }

    // Object literal
    if (t.isObjectExpression(expr)) {
      const obj: Record<string, LiteralValue> = {}
      for (const prop of expr.properties) {
        if (t.isObjectProperty(prop) && !prop.computed) {
          const key = t.isIdentifier(prop.key) ? prop.key.name : String((prop.key as any).value)
          obj[key] = this.analyzeValue(prop.value as t.Expression, path) as LiteralValue
        }
      }
      return { kind: 'literal', type: 'object', value: obj }
    }

    // Store.get() call
    if (t.isCallExpression(expr) && t.isMemberExpression(expr.callee)) {
      const object = expr.callee.object
      const property = expr.callee.property

      if (t.isIdentifier(object) && t.isIdentifier(property) && property.name === 'get') {
        const varName = object.name
        if (this.storeVarToConfig.has(varName)) {
          const storeRef = this.storeVarToConfig.get(varName)!
          const keyPathArg = expr.arguments[0]
          if (keyPathArg && !t.isSpreadElement(keyPathArg) && !t.isArgumentPlaceholder(keyPathArg)) {
            const keyPath = this.extractKeyPath(keyPathArg)
            return { kind: 'storeValue', storeRef, keyPath }
          }
        }
      }
    }

    // Binary expression (arithmetic)
    if (t.isBinaryExpression(expr)) {
      const left = this.analyzeValue(expr.left as t.Expression, path)
      const right = this.analyzeValue(expr.right, path)

      const operationMap: Record<string, string> = {
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide',
        '%': 'modulo',
      }

      const operation = operationMap[expr.operator]
      if (operation) {
        return { kind: 'computed', operation: operation as any, operands: [left, right] }
      }
    }

    // Identifier (could be local variable or function parameter)
    if (t.isIdentifier(expr)) {
      // Check if it's a local variable (including callback parameters)
      if (this.localVariables.has(expr.name)) {
        // This is a parameter from a callback (e.g., 'data' or 'error')
        // Treat it as event data that will be provided at runtime
        return { kind: 'eventData', path: 'value' }
      }

      // Check if it's a handler parameter (e.g., event data)
      const functionNode = path.node
      const paramIndex = functionNode.params.findIndex(
        (param) => t.isIdentifier(param) && param.name === expr.name,
      )
      if (paramIndex !== -1) {
        // First parameter is typically event data
        return { kind: 'eventData', path: 'value' } // Default to 'value' property
      }

      // Unknown identifier - external variable reference
      throw createExternalVariableError(expr.name, expr)
    }

    throw createUnsupportedExpressionError(expr.type, expr)
  }

  /**
   * Extract key path from expression (must be string literal)
   */
  private extractKeyPath(expr: t.Expression): string {
    if (t.isStringLiteral(expr)) {
      return expr.value
    }

    throw createInvalidStoreOperationError('KeyPath must be a string literal', expr)
  }

  /**
   * Analyze navigation action
   */
  private analyzeNavigationAction(
    method: string,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    switch (method) {
      case 'push': {
        const screenId = this.extractStringArg(args, 0, 'navigate.push() requires screenId')
        const paramsArg = args[1]
        const params = paramsArg && !t.isSpreadElement(paramsArg) && !t.isArgumentPlaceholder(paramsArg)
          ? this.extractParamsObject(paramsArg as t.Expression, path)
          : undefined
        return {
          id: this.generateActionId(),
          kind: 'navigation.push',
          screenId,
          params,
        } as NavigationPushAction
      }
      case 'pop': {
        return {
          id: this.generateActionId(),
          kind: 'navigation.pop',
        } as NavigationPopAction
      }
      case 'replace': {
        const screenId = this.extractStringArg(args, 0, 'navigate.replace() requires screenId')
        const paramsArg = args[1]
        const params = paramsArg && !t.isSpreadElement(paramsArg) && !t.isArgumentPlaceholder(paramsArg)
          ? this.extractParamsObject(paramsArg as t.Expression, path)
          : undefined
        return {
          id: this.generateActionId(),
          kind: 'navigation.replace',
          screenId,
          params,
        } as NavigationReplaceAction
      }
      case 'modal': {
        const screenId = this.extractStringArg(args, 0, 'navigate.modal() requires screenId')
        const paramsArg = args[1]
        const params = paramsArg && !t.isSpreadElement(paramsArg) && !t.isArgumentPlaceholder(paramsArg)
          ? this.extractParamsObject(paramsArg as t.Expression, path)
          : undefined
        return {
          id: this.generateActionId(),
          kind: 'navigation.modal',
          screenId,
          params,
        } as NavigationModalAction
      }
      case 'dismissModal': {
        return {
          id: this.generateActionId(),
          kind: 'navigation.dismissModal',
        }
      }
      case 'popTo': {
        const screenId = this.extractStringArg(args, 0, 'navigate.popTo() requires screenId')
        return {
          id: this.generateActionId(),
          kind: 'navigation.popTo',
          screenId,
        }
      }
      case 'reset': {
        const screenId = this.extractStringArg(args, 0, 'navigate.reset() requires screenId')
        const paramsArg = args[1]
        const params = paramsArg && !t.isSpreadElement(paramsArg) && !t.isArgumentPlaceholder(paramsArg)
          ? this.extractParamsObject(paramsArg as t.Expression, path)
          : undefined
        return {
          id: this.generateActionId(),
          kind: 'navigation.reset',
          screenId,
          params,
        }
      }
      default:
        return null
    }
  }

  /**
   * Analyze UI action
   */
  private analyzeUIAction(
    method: string,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    switch (method) {
      case 'showToast': {
        const messageArg = args[0]
        if (!messageArg || t.isSpreadElement(messageArg) || t.isArgumentPlaceholder(messageArg)) {
          throw new Error('ui.showToast() requires message')
        }
        const message = this.analyzeValue(messageArg as t.Expression, path)
        return {
          id: this.generateActionId(),
          kind: 'ui.showToast',
          message,
        } as ShowToastAction
      }
      case 'showAlert': {
        const titleArg = args[0]
        if (!titleArg || t.isSpreadElement(titleArg) || t.isArgumentPlaceholder(titleArg)) {
          throw new Error('ui.showAlert() requires title')
        }
        const title = this.analyzeValue(titleArg as t.Expression, path)
        return {
          id: this.generateActionId(),
          kind: 'ui.showAlert',
          title,
          buttons: [], // Will be filled from options if provided
        } as ShowAlertAction
      }
      case 'showSheet': {
        return {
          id: this.generateActionId(),
          kind: 'ui.showSheet',
          options: [], // Will be filled if provided
        } as ShowSheetAction
      }
      case 'dismissSheet': {
        return {
          id: this.generateActionId(),
          kind: 'ui.dismissSheet',
        }
      }
      case 'showLoading': {
        return {
          id: this.generateActionId(),
          kind: 'ui.showLoading',
        }
      }
      case 'hideLoading': {
        return {
          id: this.generateActionId(),
          kind: 'ui.hideLoading',
        }
      }
      default:
        return null
    }
  }

  /**
   * Analyze system action
   */
  private analyzeSystemAction(
    method: string,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    switch (method) {
      case 'share': {
        if (args.length < 1) {
          throw createUnsupportedExpressionError('share() requires content argument', args[0] as Node)
        }
        const contentArg = args[0]
        if (t.isSpreadElement(contentArg) || t.isArgumentPlaceholder(contentArg)) {
          throw new Error('Spread elements not supported in content')
        }
        // Expect object with text, url properties
        const contentValue = this.analyzeValue(contentArg as t.Expression, path)
        return {
          id: this.generateActionId(),
          kind: 'system.share',
          content: contentValue.kind === 'literal' && contentValue.type === 'object'
            ? contentValue.value as any
            : { text: contentValue },
        } as ShareAction
      }
      case 'openUrl': {
        const urlArg = args[0]
        if (!urlArg || t.isSpreadElement(urlArg) || t.isArgumentPlaceholder(urlArg)) {
          throw new Error('openUrl() requires url')
        }
        const url = this.analyzeValue(urlArg as t.Expression, path)
        return {
          id: this.generateActionId(),
          kind: 'system.openUrl',
          url,
        } as OpenUrlAction
      }
      case 'haptic': {
        const style = this.extractStringArg(args, 0, 'haptic() requires style') as any
        return {
          id: this.generateActionId(),
          kind: 'system.haptic',
          style,
        } as HapticAction
      }
      case 'copyToClipboard': {
        return {
          id: this.generateActionId(),
          kind: 'system.copyToClipboard',
          text: this.extractStringArg(args, 0, 'copyToClipboard() requires text'),
        }
      }
      case 'requestCameraPermission': {
        return {
          id: this.generateActionId(),
          kind: 'system.requestPermission',
          permission: 'camera',
        }
      }
      case 'requestPhotoLibraryPermission': {
        return {
          id: this.generateActionId(),
          kind: 'system.requestPermission',
          permission: 'photoLibrary',
        }
      }
      case 'requestLocationPermission': {
        return {
          id: this.generateActionId(),
          kind: 'system.requestPermission',
          permission: 'location',
        }
      }
      case 'requestNotificationPermission': {
        return {
          id: this.generateActionId(),
          kind: 'system.requestPermission',
          permission: 'notification',
        }
      }
      default:
        return null
    }
  }

  /**
   * Analyze API action
   */
  private analyzeApiAction(
    methodName: string,
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    path: NodePath<t.Function>,
  ): ActionDescriptor | null {
    if (methodName !== 'request') {
      return null
    }

    // api.request() requires a config object as first argument
    if (args.length < 1) {
      throw new Error('api.request() requires a config object')
    }

    const configArg = args[0]
    if (t.isSpreadElement(configArg) || t.isArgumentPlaceholder(configArg)) {
      throw new Error('Spread elements not supported in config')
    }

    if (!t.isObjectExpression(configArg)) {
      throw new Error('api.request() config must be an object literal')
    }

    // Extract config properties
    let endpoint: string | undefined
    let httpMethod: string | undefined
    let headers: Record<string, ValueDescriptor> | undefined
    let body: ValueDescriptor | undefined
    let onSuccess: ActionDescriptor | undefined
    let onError: ActionDescriptor | undefined

    for (const prop of configArg.properties) {
      if (!t.isObjectProperty(prop) || prop.computed) continue

      const key = t.isIdentifier(prop.key) ? prop.key.name : String((prop.key as any).value)
      const value = prop.value

      switch (key) {
        case 'endpoint':
          if (t.isStringLiteral(value)) {
            endpoint = value.value
          } else {
            throw new Error('endpoint must be a string literal')
          }
          break

        case 'method':
          if (t.isStringLiteral(value)) {
            httpMethod = value.value
          } else {
            throw new Error('method must be a string literal')
          }
          break

        case 'headers':
          if (t.isObjectExpression(value)) {
            headers = {}
            for (const headerProp of value.properties) {
              if (t.isObjectProperty(headerProp) && !headerProp.computed) {
                let headerKey: string
                if (t.isIdentifier(headerProp.key)) {
                  headerKey = headerProp.key.name
                } else if (t.isStringLiteral(headerProp.key)) {
                  headerKey = headerProp.key.value
                } else {
                  continue
                }
                headers[headerKey] = this.analyzeValue(headerProp.value as t.Expression, path)
              }
            }
          }
          break

        case 'body':
          body = this.analyzeValue(value as t.Expression, path)
          break

        case 'onSuccess':
          // Analyze onSuccess callback
          if (t.isArrowFunctionExpression(value) || t.isFunctionExpression(value)) {
            // Track callback parameters as local variables
            const previousLocalVars = new Set(this.localVariables)
            value.params.forEach((param) => {
              if (t.isIdentifier(param)) {
                this.localVariables.add(param.name)
              }
            })

            const successAction = this.analyzeHandlerBody(value.body, path)
            if (successAction) {
              onSuccess = successAction
            }

            // Restore previous local variables
            this.localVariables = previousLocalVars
          }
          break

        case 'onError':
          // Analyze onError callback
          if (t.isArrowFunctionExpression(value) || t.isFunctionExpression(value)) {
            // Track callback parameters as local variables
            const previousLocalVars = new Set(this.localVariables)
            value.params.forEach((param) => {
              if (t.isIdentifier(param)) {
                this.localVariables.add(param.name)
              }
            })

            const errorAction = this.analyzeHandlerBody(value.body, path)
            if (errorAction) {
              onError = errorAction
            }

            // Restore previous local variables
            this.localVariables = previousLocalVars
          }
          break

        case 'responseMapping':
          // TODO: Implement response mapping if needed
          break
      }
    }

    if (!endpoint) {
      throw new Error('api.request() requires an endpoint')
    }

    if (!httpMethod) {
      throw new Error('api.request() requires a method')
    }

    const action: ApiRequestAction = {
      id: this.generateActionId(),
      kind: 'api.request',
      endpoint,
      method: httpMethod as any,
      headers,
      body,
    }

    // Add onSuccess/onError as sequence if they exist
    if (onSuccess || onError) {
      ;(action as any).onSuccess = onSuccess
      ;(action as any).onError = onError
    }

    return action
  }

  /**
   * Extract params object from expression
   */
  private extractParamsObject(
    expr: t.Expression,
    path: NodePath<t.Function>,
  ): Record<string, ValueDescriptor> | undefined {
    if (!t.isObjectExpression(expr)) {
      return undefined
    }

    const params: Record<string, ValueDescriptor> = {}
    for (const prop of expr.properties) {
      if (t.isObjectProperty(prop) && !prop.computed && t.isIdentifier(prop.key)) {
        const key = prop.key.name
        params[key] = this.analyzeValue(prop.value as t.Expression, path)
      }
    }
    return params
  }

  /**
   * Extract string argument from arguments array
   */
  private extractStringArg(
    args: Array<t.Expression | t.SpreadElement | t.ArgumentPlaceholder>,
    index: number,
    errorMessage: string,
  ): string {
    if (args.length <= index) {
      throw new Error(errorMessage)
    }

    const arg = args[index]
    if (t.isSpreadElement(arg) || t.isArgumentPlaceholder(arg)) {
      throw new Error('Spread elements not supported')
    }

    if (!t.isStringLiteral(arg)) {
      throw new Error(`${errorMessage} (must be a string literal)`)
    }

    return arg.value
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    this.actionIdCounter += 1
    return `action_${this.actionIdCounter}`
  }
}
