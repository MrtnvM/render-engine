export interface SerializedIdentifier {
  type: 'Identifier'
  name: string
}

export interface SerializedLiteralExpression {
  type: 'StringLiteral' | 'NumericLiteral' | 'BooleanLiteral' | 'NullLiteral'
  value: string | number | boolean | null
}

export interface SerializedUnaryExpression {
  type: 'UnaryExpression'
  operator: string
  argument: SerializedExpression
  prefix: boolean
}

export interface SerializedBinaryExpression {
  type: 'BinaryExpression'
  operator: string
  left: SerializedExpression
  right: SerializedExpression
}

export interface SerializedLogicalExpression {
  type: 'LogicalExpression'
  operator: string
  left: SerializedExpression
  right: SerializedExpression
}

export interface SerializedConditionalExpression {
  type: 'ConditionalExpression'
  test: SerializedExpression
  consequent: SerializedExpression
  alternate: SerializedExpression
}

export interface SerializedCallExpression {
  type: 'CallExpression'
  callee: SerializedExpression
  arguments: SerializedExpression[]
}

export interface SerializedMemberExpression {
  type: 'MemberExpression'
  object: SerializedExpression
  property: SerializedExpression
  computed: boolean
}

export interface SerializedAssignmentExpression {
  type: 'AssignmentExpression'
  operator: string
  left: SerializedExpression
  right: SerializedExpression
}

export interface SerializedUpdateExpression {
  type: 'UpdateExpression'
  operator: string
  argument: SerializedExpression
  prefix: boolean
}

export interface SerializedArrayExpression {
  type: 'ArrayExpression'
  elements: SerializedExpression[]
}

export interface SerializedObjectProperty {
  key: string
  value: SerializedExpression
}

export interface SerializedObjectExpression {
  type: 'ObjectExpression'
  properties: SerializedObjectProperty[]
}

export type SerializedExpression =
  | SerializedIdentifier
  | SerializedLiteralExpression
  | SerializedUnaryExpression
  | SerializedBinaryExpression
  | SerializedLogicalExpression
  | SerializedConditionalExpression
  | SerializedCallExpression
  | SerializedMemberExpression
  | SerializedAssignmentExpression
  | SerializedUpdateExpression
  | SerializedArrayExpression
  | SerializedObjectExpression

export interface SerializedExpressionStatement {
  type: 'ExpressionStatement'
  expression: SerializedExpression
}

export interface SerializedReturnStatement {
  type: 'ReturnStatement'
  argument?: SerializedExpression
}

export interface SerializedIfStatement {
  type: 'IfStatement'
  test: SerializedExpression
  consequent: SerializedStatement
  alternate?: SerializedStatement
}

export interface SerializedWhileStatement {
  type: 'WhileStatement'
  test: SerializedExpression
  body: SerializedStatement
}

export interface SerializedVariableDeclarator {
  id: SerializedIdentifier
  init?: SerializedExpression
}

export interface SerializedVariableDeclaration {
  type: 'VariableDeclaration'
  kind: 'var' | 'let' | 'const'
  declarations: SerializedVariableDeclarator[]
}

export interface SerializedBlockStatement {
  type: 'BlockStatement'
  body: SerializedStatement[]
}

export interface SerializedForStatement {
  type: 'ForStatement'
  init?: SerializedVariableDeclaration | SerializedExpression
  test?: SerializedExpression
  update?: SerializedExpression
  body: SerializedStatement
}

export interface SerializedBreakStatement {
  type: 'BreakStatement'
}

export interface SerializedContinueStatement {
  type: 'ContinueStatement'
}

export type SerializedStatement =
  | SerializedExpressionStatement
  | SerializedReturnStatement
  | SerializedIfStatement
  | SerializedWhileStatement
  | SerializedVariableDeclaration
  | SerializedBlockStatement
  | SerializedForStatement
  | SerializedBreakStatement
  | SerializedContinueStatement

export interface SerializedActionHandler {
  params: SerializedIdentifier[]
  body: SerializedStatement
}
