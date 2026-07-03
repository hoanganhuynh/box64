export type SnapshotDiff = Record<string, { before: unknown; after: unknown }>

// Shallow key-level diff of two JSON snapshots; values compared structurally.
export function diffSnapshots(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): SnapshotDiff {
  const b = before ?? {}
  const a = after ?? {}
  const keys = new Set([...Object.keys(b), ...Object.keys(a)])
  const diff: SnapshotDiff = {}
  for (const key of keys) {
    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
      diff[key] = { before: b[key], after: a[key] }
    }
  }
  return diff
}
