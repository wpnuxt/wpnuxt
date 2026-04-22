import { existsSync, readFileSync } from 'node:fs'
import ts from 'typescript'

export interface GeneratedPathValidationResult {
  /** True if the operations declaration file doesn't exist yet — nothing to validate against. */
  skipped: boolean
  /** Top-level type identifiers referenced by the generator that are not declared in the operations file. */
  dangling: string[]
}

/**
 * Validate that the top-level type identifiers referenced by WPNuxt's generated
 * composables exist in nuxt-graphql-middleware's `graphql-operations.d.ts`.
 *
 * Dangling references indicate schema drift between the merged queries and the
 * live WordPress GraphQL schema — typically because a query selects a field or
 * fragment that no longer exists. Today the symptom is a cryptic TypeScript
 * error in user code; this surfaces it as a build-time warning in the module.
 *
 * Scope is intentionally conservative: only top-level identifiers declared by
 * `graphql-operations.d.ts` (type aliases, interfaces, consts) are checked.
 * Deeper path walks (e.g. `NonNullable<X>['field']['nodes'][number]`) are out
 * of scope for this pass — they would require the full TypeScript type
 * checker, which is disproportionate for the value.
 */
export function validateGeneratedPaths(
  referencedTypes: Iterable<string>,
  operationsDtsPath: string
): GeneratedPathValidationResult {
  if (!existsSync(operationsDtsPath)) {
    return { skipped: true, dangling: [] }
  }

  const source = readFileSync(operationsDtsPath, 'utf8')
  const sourceFile = ts.createSourceFile(
    operationsDtsPath,
    source,
    ts.ScriptTarget.Latest,
    false
  )

  const declared = new Set<string>()
  const visit = (node: ts.Node) => {
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) {
      if (node.name) declared.add(node.name.text)
    } else if (ts.isVariableStatement(node)) {
      for (const d of node.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) declared.add(d.name.text)
      }
    } else if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
      // Walk into `declare module '...' { ... }` blocks so re-declared
      // symbols are counted too.
      for (const child of node.body.statements) visit(child)
    }
  }
  for (const stmt of sourceFile.statements) visit(stmt)

  const dangling: string[] = []
  const seen = new Set<string>()
  for (const ref of referencedTypes) {
    if (seen.has(ref)) continue
    seen.add(ref)
    if (!declared.has(ref)) dangling.push(ref)
  }

  return { skipped: false, dangling }
}
