const getRelativeImagePath = function getRelativeImagePath(imgUrl: string): string {
  if (imgUrl) {
    const url = new URL(imgUrl)
    imgUrl = url.pathname
  }
  return imgUrl
}

export { getRelativeImagePath }
