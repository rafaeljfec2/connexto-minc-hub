/**
 * Natural sort comparison function for strings containing numbers
 * Handles cases like "EQUIPE 1", "EQUIPE 2", "EQUIPE 10" correctly
 * @param a First string to compare
 * @param b Second string to compare
 * @returns Comparison result (-1, 0, or 1)
 */
export function naturalSort(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  // Split strings into parts (text and numbers)
  const aParts = aLower.match(/(\d+|\D+)/g) ?? []
  const bParts = bLower.match(/(\d+|\D+)/g) ?? []

  const maxLength = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] ?? ''
    const bPart = bParts[i] ?? ''

    // If both parts are numbers, compare numerically
    const aNum = Number.parseInt(aPart, 10)
    const bNum = Number.parseInt(bPart, 10)

    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      if (aNum !== bNum) {
        return aNum - bNum
      }
    } else {
      // Compare as strings
      if (aPart !== bPart) {
        return aPart < bPart ? -1 : 1
      }
    }
  }

  return 0
}

/**
 * Creates a natural sort extractor function for use with sorting hooks
 * @param getValue Function to extract the value to sort by
 * @returns A sort key function that returns a sortable value
 */
export function naturalSortKey<T>(getValue: (item: T) => string): (item: T) => string {
  return (item: T) => {
    const value = getValue(item)
    // Pad numbers with zeros for proper sorting
    return value.replace(/\d+/g, match => match.padStart(10, '0'))
  }
}
