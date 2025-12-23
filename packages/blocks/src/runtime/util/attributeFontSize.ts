export const convertFontSize = function convertFontSize(fontSize: string | undefined, prefix?: string, defaultSize?: string): string {
  if (!prefix) prefix = ''
  if (fontSize && fontSize !== '' && fontSize !== 'null') {
    switch (fontSize) {
      case 'small':
        return prefix + 'sm'
      case 'medium':
        return prefix + 'md'
      case 'large':
        return prefix + 'lg'
      case 'x-large':
        return prefix + 'xl'
      case 'xx-large':
        return prefix + '2xl'
    }
  }
  return defaultSize ? prefix + defaultSize : ''
}
