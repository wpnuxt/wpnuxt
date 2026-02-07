import { convertFontSize } from './attributeFontSize'
import { getColor } from './attributeColor'
import type { EditorBlock } from '../types'

const getCssClasses = function getCssClasses(block: EditorBlock) {
  const attrs = block.attributes as Record<string, string | undefined> | null | undefined
  const text = convertFontSize(attrs?.fontSize, 'text-')
  const color = getColor(attrs?.textColor)
  const passedOn = attrs?.className != null ? attrs.className + ' ' : ' '

  return passedOn + text + ' ' + color
}

export { getCssClasses, convertFontSize, getColor }
