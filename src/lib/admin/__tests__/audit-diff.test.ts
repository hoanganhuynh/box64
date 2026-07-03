import { describe, it, expect } from 'vitest'
import { diffSnapshots } from '../audit-diff'

describe('diffSnapshots', () => {
  it('returns only changed keys', () => {
    const before = { name: 'A', price: 100, stock: 5 }
    const after = { name: 'A', price: 200, stock: 5 }
    expect(diffSnapshots(before, after)).toEqual({ price: { before: 100, after: 200 } })
  })

  it('includes added and removed keys', () => {
    expect(diffSnapshots({ a: 1 }, { b: 2 })).toEqual({
      a: { before: 1, after: undefined },
      b: { before: undefined, after: 2 },
    })
  })

  it('compares nested values structurally, not by reference', () => {
    expect(diffSnapshots({ tags: ['x'] }, { tags: ['x'] })).toEqual({})
    expect(diffSnapshots({ tags: ['x'] }, { tags: ['y'] })).toEqual({
      tags: { before: ['x'], after: ['y'] },
    })
  })

  it('handles null/missing snapshots (create and delete)', () => {
    expect(diffSnapshots(null, { a: 1 })).toEqual({ a: { before: undefined, after: 1 } })
    expect(diffSnapshots({ a: 1 }, null)).toEqual({ a: { before: 1, after: undefined } })
    expect(diffSnapshots(null, null)).toEqual({})
  })
})
