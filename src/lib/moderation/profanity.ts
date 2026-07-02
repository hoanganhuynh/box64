// Strips diacritics, punctuation, and spacing tricks (e.g. "d.m", "d m")
// so matching is resilient to the most common ways people dodge a filter.
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function containsBannedWord(text: string, bannedWords: string[]): boolean {
  const compact = normalizeForMatch(text).replace(/\s+/g, '')
  if (!compact) return false
  return bannedWords.some(w => {
    const nw = normalizeForMatch(w).replace(/\s+/g, '')
    return nw.length > 0 && compact.includes(nw)
  })
}
