import type {
  ArrowFunctionExpression,
  FunctionExpression,
  Statement,
  Expression,
  BlockStatement,
  Identifier,
  VariableDeclaration,
  VariableDeclarator,
  Pattern,
} from '@babel/types'
import type {
  SerializedActionHandler,
  SerializedBlockStatement,
  SerializedStatement,
  SerializedExpression,
  SerializedIdentifier,
  SerializedVariableDeclaration,
  SerializedVariableDeclarator,
} from '../../runtime/serialized-handler-types.js'

function serializeIdentifier(node: Identifier): SerializedIdentifier {
  return { type: 'Identifier', name: node.name }
}

function serializeLiteral(node: any): SerializedExpression {
  switch (node.type) {
    case 'StringLiteral':
      return { type: 'StringLiteral', value: node.value }
    case 'NumericLiteral':
      return { type: 'NumericLiteral', value: node.value }
    case 'BooleanLiteral':
      return { type: 'BooleanLiteral', value: node.value }
    case 'NullLiteral':
      return { type: 'NullLiteral', value: null }
    default:
      throw new Error(`Unsupported literal type: ${node.type}`)
  }
}

function serializeObjectExpression(node: any): SerializedExpression {
  return {
    type: 'ObjectExpression',
    properties: node.properties.map((prop: any) => {
      if (prop.type !== 'ObjectProperty') {
        throw new Error(`Unsupported object property type: ${prop.type}`)
      }
      if (prop.key.type !== 'Identifier' && prop.key.type !== 'StringLiteral') {
        throw new Error(`Unsupported object key type: ${prop.key.type}`)
      }
      const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value
      return {
        key,
        value: serializeExpression(prop.value),
      }
    }),
  }
}

function serializeArrayExpression(node: any): SerializedExpression {
  return {
    type: 'ArrayExpression',
    elements: node.elements.map((el: any) => {
      if (!el) {
        throw new Error('Unsupported empty array element in handler serialization')
      }
      return serializeExpression(el)
    }),
  }
}

function serializePattern(pattern: Pattern): SerializedIdentifier {
  if (pattern.type === 'Identifier') {
    return serializeIdentifier(pattern)
  }
  throw new Error(`Unsupported parameter pattern type: ${pattern.type}`)
}

function serializeVariableDeclarator(node: VariableDeclarator): SerializedVariableDeclarator {
  if (node.id.type !== 'Identifier') {
    throw new Error(`Unsupported variable declarator id type: ${node.id.type}`)
  }
  return {
    id: serializeIdentifier(node.id),
    init: node.init ? serializeExpression(node.init) : undefined,
  }
}

function serializeVariableDeclaration(node: VariableDeclaration): SerializedVariableDeclaration {
  return {
    type: 'VariableDeclaration',
    kind: node.kind,
    declarations: node.declarations.map(serializeVariableDeclarator),
  }
}

function serializeExpression(node: Expression): SerializedExpression {
  switch (node.type) {
    case 'Identifier':
      return serializeIdentifier(node)
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
    case 'NullLiteral':
      return serializeLiteral(node)
    case 'UnaryExpression':
      return {
        type: 'UnaryExpression',
        operator: node.operator,
        argument: serializeExpression(node.argument),
        prefix: node.prefix,
      }
    case 'BinaryExpression':
      return {
        type: 'BinaryExpression',
        operator: node.operator,
        left: serializeExpression(node.left),
        right: serializeExpression(node.right),
      }
    case 'LogicalExpression':
      return {
        type: 'LogicalExpression',
        operator: node.operator,
        left: serializeExpression(node.left),
        right: serializeExpression(node.right),
      }
    case 'ConditionalExpression':
      return {
        type: 'ConditionalExpression',
        test: serializeExpression(node.test),
        consequent: serializeExpression(node.consequent),
        alternate: serializeExpression(node.alternate),
      }
    case 'CallExpression':
      return {
        type: 'CallExpression',
        callee: serializeExpression(node.callee as Expression),
        arguments: node.arguments.map((arg) => {
          if (arg.type === 'SpreadElement') {
            throw new Error('Spread elements are not supported in action handlers')
          }
          return serializeExpression(arg as Expression)
        }),
      }
    case 'MemberExpression':
      return {
        type: 'MemberExpression',
        object: serializeExpression(node.object as Expression),
        property: serializeExpression(node.property as Expression),
        computed: node.computed ?? false,
      }
    case 'AssignmentExpression':
      return {
        type: 'AssignmentExpression',
        operator: node.operator,
        left: serializeExpression(node.left as Expression),
        right: serializeExpression(node.right),
      }
    case 'UpdateExpression':
      return {
        type: 'UpdateExpression',
        operator: node.operator,
        argument: serializeExpression(node.argument as Expression),
        prefix: node.prefix,
      }
    case 'ArrayExpression':
      return serializeArrayExpression(node)
    case 'ObjectExpression':
      return serializeObjectExpression(node)
    default:
      throw new Error(`Unsupported expression type in action handler: ${node.type}`)
  }
}

function serializeStatement(node: Statement): SerializedStatement {
  switch (node.type) {
    case 'ExpressionStatement':
      return {
        type: 'ExpressionStatement',
        expression: serializeExpression(node.expression),
      }
    case 'ReturnStatement':
      return {
        type: 'ReturnStatement',
        argument: node.argument ? serializeExpression(node.argument) : undefined,
      }
    case 'IfStatement':
      return {
        type: 'IfStatement',
        test: serializeExpression(node.test),
        consequent: serializeStatement(node.consequent as Statement),
        alternate: node.alternate ? serializeStatement(node.alternate as Statement) : undefined,
      }
    case 'WhileStatement':
      return {
        type: 'WhileStatement',
        test: serializeExpression(node.test),
        body: serializeStatement(node.body as Statement),
      }
    case 'VariableDeclaration':
      return serializeVariableDeclaration(node)
    case 'BlockStatement':
      return serializeBlockStatement(node)
    case 'ForStatement':
      return {
        type: 'ForStatement',
        init: node.init
          ? node.init.type === 'VariableDeclaration'
            ? serializeVariableDeclaration(node.init)
            : serializeExpression(node.init as Expression)
          : undefined,
        test: node.test ? serializeExpression(node.test) : undefined,
        update: node.update ? serializeExpression(node.update as Expression) : undefined,
        body: serializeStatement(node.body as Statement),
      }
    case 'BreakStatement':
      return { type: 'BreakStatement' }
    case 'ContinueStatement':
      return { type: 'ContinueStatement' }
    default:
      throw new Error(`Unsupported statement type in action handler: ${node.type}`)
  }
}

function serializeBlockStatement(node: BlockStatement): SerializedBlockStatement {
  return {
    type: 'BlockStatement',
    body: node.body.map((stmt) => serializeStatement(stmt as Statement)),
  }
}

export function serializeActionHandler(
  node: ArrowFunctionExpression | FunctionExpression,
): SerializedActionHandler {
  const params = node.params.map((param) => serializePattern(param))
  const body: SerializedStatement =
    node.body.type === 'BlockStatement'
      ? serializeBlockStatement(node.body)
      : {
          type: 'ReturnStatement',
          argument: serializeExpression(node.body as Expression),
        }

  return {
    params,
    body,
  }
}
