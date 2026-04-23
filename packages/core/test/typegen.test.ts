import { describe, it, expect } from 'vitest'
import {
  arrayOf,
  indexedAccess,
  nonNullable,
  numberIndexedAccess,
  printType,
  typeRef,
  unionOrSingle,
  withImagePath
} from '../src/utils/typegen'

describe('typegen', () => {
  describe('typeRef', () => {
    it('prints a bare identifier', () => {
      expect(printType(typeRef('PostFragment'))).toBe('PostFragment')
    })

    it('prints a generic instantiation', () => {
      expect(printType(typeRef('Array', [typeRef('Post')]))).toBe('Array<Post>')
    })
  })

  describe('nonNullable', () => {
    it('wraps a type in NonNullable<>', () => {
      expect(printType(nonNullable(typeRef('PostsRootQuery')))).toBe('NonNullable<PostsRootQuery>')
    })
  })

  describe('withImagePath', () => {
    it('wraps a type in WithImagePath<>', () => {
      expect(printType(withImagePath(typeRef('PostFragment')))).toBe('WithImagePath<PostFragment>')
    })
  })

  describe('indexedAccess', () => {
    it('emits a string-literal indexed access', () => {
      const node = indexedAccess(nonNullable(typeRef('PostsRootQuery')), 'posts')
      expect(printType(node)).toBe(`NonNullable<PostsRootQuery>['posts']`)
    })

    it('chains', () => {
      const node = indexedAccess(indexedAccess(nonNullable(typeRef('PostsRootQuery')), 'posts'), 'nodes')
      expect(printType(node)).toBe(`NonNullable<PostsRootQuery>['posts']['nodes']`)
    })
  })

  describe('numberIndexedAccess', () => {
    it('emits [number]', () => {
      const node = numberIndexedAccess(typeRef('PostFragment'))
      expect(printType(node)).toBe('PostFragment[number]')
    })
  })

  describe('arrayOf', () => {
    it('emits T[]', () => {
      expect(printType(arrayOf(typeRef('PostFragment')))).toBe('PostFragment[]')
    })
  })

  describe('unionOrSingle', () => {
    it('unwraps a single-element union to the element', () => {
      expect(printType(unionOrSingle([typeRef('PostFragment')]))).toBe('PostFragment')
    })

    it('emits a union for multiple elements', () => {
      expect(printType(unionOrSingle([typeRef('PostFragment'), typeRef('PageFragment')])))
        .toBe('PostFragment | PageFragment')
    })

    it('throws on an empty list', () => {
      expect(() => unionOrSingle([])).toThrow()
    })
  })

  describe('full path composition', () => {
    it('builds a connection item type', () => {
      // Mirrors generate.ts for a connection query with inline fields, nodes=['posts']
      let node = typeRef('PostsRootQuery') as Parameters<typeof nonNullable>[0]
      node = indexedAccess(nonNullable(node), 'posts')
      const final = numberIndexedAccess(indexedAccess(nonNullable(node), 'nodes'))
      expect(printType(final)).toBe(
        `NonNullable<NonNullable<PostsRootQuery>['posts']>['nodes'][number]`
      )
    })

    it('builds a non-connection list type with fragments', () => {
      const final = unionOrSingle([arrayOf(withImagePath(typeRef('PostFragment')))])
      expect(printType(final)).toBe('WithImagePath<PostFragment>[]')
    })

    it('builds a connection singular fragment type', () => {
      const final = unionOrSingle([
        withImagePath(typeRef('PageFragment')),
        withImagePath(typeRef('PostFragment'))
      ])
      expect(printType(final)).toBe('WithImagePath<PageFragment> | WithImagePath<PostFragment>')
    })
  })
})
