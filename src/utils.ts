export function randHashGenerator(length = 12) {
  const randomChar = () => Math.floor(36 * Math.random()).toString(36)

  return Array<string>(length)
    .fill(String())
    .map(randomChar)
    .reduce((acc, cur) => {
      return acc + cur.toUpperCase()
    }, '')
}
