const getRelativeImagePath = function getRelativeImagePath(imgUrl: string): string {
  if (!imgUrl || typeof imgUrl !== 'string') {
    return ''
  }

  try {
    const url = new URL(imgUrl)
    return url.pathname
  } catch (error) {
    // If URL parsing fails, assume it's already a relative path
    // or return the original if it starts with /
    if (imgUrl.startsWith('/')) {
      return imgUrl
    }
    console.warn(`WPNuxt: Invalid image URL provided: ${imgUrl}`)
    return ''
  }
}

export { getRelativeImagePath }
