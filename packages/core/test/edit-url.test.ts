import { describe, it, expect, vi } from 'vitest'

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ public: { wpNuxt: { wordpressUrl: 'https://wordpress.example.com' } } })
}))

const { getWPEditUrl } = await import('../src/runtime/util/edit-url')

describe('getWPEditUrl', () => {
  it('should return the wp-admin edit URL for a database ID', () => {
    expect(getWPEditUrl(123)).toBe('https://wordpress.example.com/wp-admin/post.php?post=123&action=edit')
  })

  it('should return undefined without a database ID', () => {
    expect(getWPEditUrl(undefined)).toBeUndefined()
    expect(getWPEditUrl(null)).toBeUndefined()
    expect(getWPEditUrl(0)).toBeUndefined()
  })

  it('should return undefined for an invalid database ID', () => {
    expect(getWPEditUrl(-1)).toBeUndefined()
    expect(getWPEditUrl(1.5)).toBeUndefined()
  })
})
