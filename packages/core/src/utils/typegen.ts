import ts from 'typescript'

const { factory, SyntaxKind, NewLineKind, EmitHint, ScriptTarget } = ts

/**
 * Small typed wrappers around `ts.factory` for the TypeScript type-path
 * shapes WPNuxt's generator emits. Using the AST instead of string
 * concatenation means misshapen output is a TypeScript compiler error,
 * not a cryptic error downstream in user code.
 */

export function typeRef(name: string, typeArguments?: ts.TypeNode[]): ts.TypeReferenceNode {
  return factory.createTypeReferenceNode(name, typeArguments)
}

export function nonNullable(node: ts.TypeNode): ts.TypeNode {
  return typeRef('NonNullable', [node])
}

export function withImagePath(node: ts.TypeNode): ts.TypeNode {
  return typeRef('WithImagePath', [node])
}

export function indexedAccess(target: ts.TypeNode, key: string): ts.TypeNode {
  return factory.createIndexedAccessTypeNode(
    target,
    // `isSingleQuote` preserves the single-quote style the generator used
    // before this module was AST-based — keeps generated .d.ts text-stable.
    factory.createLiteralTypeNode(factory.createStringLiteral(key, true))
  )
}

export function numberIndexedAccess(target: ts.TypeNode): ts.TypeNode {
  return factory.createIndexedAccessTypeNode(
    target,
    factory.createKeywordTypeNode(SyntaxKind.NumberKeyword)
  )
}

export function arrayOf(node: ts.TypeNode): ts.TypeNode {
  return factory.createArrayTypeNode(node)
}

export function unionOrSingle(nodes: ts.TypeNode[]): ts.TypeNode {
  if (nodes.length === 0) {
    throw new Error('unionOrSingle: empty type list')
  }
  if (nodes.length === 1) return nodes[0]!
  return factory.createUnionTypeNode(nodes)
}

const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed, removeComments: false })
const syntheticFile = ts.createSourceFile('__synthetic.ts', '', ScriptTarget.Latest)

/**
 * Print a TypeScript type node to a string for embedding in generated source.
 */
export function printType(node: ts.TypeNode): string {
  return printer.printNode(EmitHint.Unspecified, node, syntheticFile)
}
