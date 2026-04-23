import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { upperFirst } from 'scule'
import type { DiscoveredCpt } from './cptDiscovery'

export interface CptArtifactResult {
  /** The CPT this was generated for. */
  cpt: DiscoveredCpt
  /** True if a fragment file was written (i.e. no override existed). */
  wroteFragment: boolean
  /** True if a query file was written (i.e. no override existed). */
  wroteQueries: boolean
}

/**
 * Write the auto-generated fragment + query GQL files for one CPT into the
 * merged queries output folder. Existing files are never overwritten — this
 * runs before `extend/queries/` is copied over, and before that the defaults
 * already populated the folder, so every file-exists check represents an
 * intentional override.
 */
export async function writeCptArtifacts(cpt: DiscoveredCpt, outputPath: string): Promise<CptArtifactResult> {
  const fragmentsDir = join(outputPath, 'fragments')
  const fragmentPath = join(fragmentsDir, `${cpt.typeName}.fragment.gql`)
  // Name the query file after the plural (e.g. `Events.gql`) to mirror the
  // built-in `Posts.gql` convention so a user's extend-folder override
  // cleanly replaces everything the generator wrote.
  const queryPath = join(outputPath, `${upperFirst(cpt.connectionField)}.gql`)

  const wroteFragment = !existsSync(fragmentPath)
  const wroteQueries = !existsSync(queryPath)

  if (wroteFragment) {
    await mkdir(fragmentsDir, { recursive: true })
    await writeFile(fragmentPath, buildCptFragment(cpt), 'utf-8')
  }

  if (wroteQueries) {
    await writeFile(queryPath, buildCptQueries(cpt), 'utf-8')
  }

  return { cpt, wroteFragment, wroteQueries }
}

/**
 * Emit the base fragment for a CPT. Spreads only interfaces the type
 * actually implements — a CPT registered without `excerpt` support does not
 * implement `NodeWithExcerpt`, and pulling that interface's fields would
 * produce an invalid query.
 */
export function buildCptFragment(cpt: DiscoveredCpt): string {
  const lines: string[] = [`fragment ${cpt.typeName} on ${cpt.typeName} {`]
  lines.push('  ...ContentNode')
  if (cpt.interfaces.has('NodeWithExcerpt')) lines.push('  ...NodeWithExcerpt')
  if (cpt.interfaces.has('NodeWithContentEditor')) lines.push('  ...NodeWithContentEditor')
  if (cpt.interfaces.has('NodeWithFeaturedImage')) lines.push('  ...NodeWithFeaturedImage')
  // `title` is not covered by any default fragment (there is no
  // NodeWithTitle.fragment.gql shipped), so include it as a direct field
  // when the type declares it.
  if (cpt.hasField.title) lines.push('  title')
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

/**
 * Emit the standard list + single-fetch queries for a CPT. Generated:
 * - `${Plural}` — cursor-based connection query with `pageInfo` for `loadMore()`.
 * - `${Type}ByUri` — single-fetch by URI, only if the CPT's idType enum includes `URI`.
 * - `${Type}BySlug` — single-fetch by slug, only if the idType enum includes `SLUG`.
 */
export function buildCptQueries(cpt: DiscoveredCpt): string {
  const { typeName, singleField, connectionField, supportedIdTypes } = cpt
  const listQueryName = upperFirst(connectionField)
  const queries: string[] = []

  queries.push(
    `query ${listQueryName}($first: Int = 20, $after: String) {`,
    `  ${connectionField}(first: $first, after: $after) {`,
    `    nodes {`,
    `      ...${typeName}`,
    `    }`,
    `    pageInfo {`,
    `      hasNextPage`,
    `      hasPreviousPage`,
    `      startCursor`,
    `      endCursor`,
    `    }`,
    `  }`,
    `}`,
    ''
  )

  if (supportedIdTypes.has('URI')) {
    queries.push(
      `query ${typeName}ByUri($uri: ID!) {`,
      `  ${singleField}(id: $uri, idType: URI) {`,
      `    ...${typeName}`,
      `  }`,
      `}`,
      ''
    )
  }

  if (supportedIdTypes.has('SLUG')) {
    queries.push(
      `query ${typeName}BySlug($slug: ID!) {`,
      `  ${singleField}(id: $slug, idType: SLUG) {`,
      `    ...${typeName}`,
      `  }`,
      `}`,
      ''
    )
  }

  return queries.join('\n')
}
