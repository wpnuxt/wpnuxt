import { describe, it, expect } from 'vitest'
import { getPreviewId } from '../src/runtime/util/preview'

describe('getPreviewId', () => {
  it('returns preview_id for a published post with unsaved changes', () => {
    expect(getPreviewId({ preview: 'true', preview_id: '123', preview_nonce: 'abc' })).toBe('123')
  })

  it('returns page_id or p for a draft', () => {
    expect(getPreviewId({ preview: 'true', page_id: '1376' })).toBe('1376')
    expect(getPreviewId({ preview: 'true', p: '42' })).toBe('42')
  })

  it('prefers preview_id over p and page_id', () => {
    expect(getPreviewId({ preview: 'true', preview_id: '1', p: '2', page_id: '3' })).toBe('1')
  })

  it('ignores the ID without preview=true', () => {
    expect(getPreviewId({ p: '123' })).toBeUndefined()
    expect(getPreviewId({ preview: 'false', page_id: '123' })).toBeUndefined()
    expect(getPreviewId({ preview: '1', page_id: '123' })).toBeUndefined()
  })

  it('returns undefined when preview=true has no ID', () => {
    expect(getPreviewId({ preview: 'true' })).toBeUndefined()
    expect(getPreviewId({ preview: 'true', p: '' })).toBeUndefined()
  })

  it('rejects values that are not a positive integer', () => {
    expect(getPreviewId({ preview: 'true', p: '0' })).toBeUndefined()
    expect(getPreviewId({ preview: 'true', p: '-5' })).toBeUndefined()
    expect(getPreviewId({ preview: 'true', p: '12abc' })).toBeUndefined()
    expect(getPreviewId({ preview: 'true', p: ['1', '2'] })).toBeUndefined()
  })
})
