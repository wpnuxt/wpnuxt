import { convertFontSize } from './attributeFontSize'
import { getColor } from './attributeColor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCssClasses = function getCssClasses(block: any) {
  const text = convertFontSize(block.attributes?.fontSize, 'text-')
  const color = getColor(block.attributes?.textColor)
  const passedOn = (block?.attributes?.className != null ? block?.attributes?.className + ' ' : ' ')

  return passedOn + text + ' ' + color
}

export { getCssClasses, convertFontSize, getColor }
