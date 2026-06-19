import { describe, it, expect } from 'vitest'
import { buildFrontFaceLayout, buildTopFaceLayout, buildSideFaceLayout } from '@/lib/canvas/boxRenderer'

describe('buildFrontFaceLayout', () => {
  it('returns canvas dimensions for minigt', () => {
    const layout = buildFrontFaceLayout('minigt')
    expect(layout.width).toBe(480)
    expect(layout.height).toBe(220)
  })
  it('returns canvas dimensions for poprace', () => {
    const layout = buildFrontFaceLayout('poprace')
    expect(layout.width).toBe(460)
    expect(layout.height).toBe(240)
  })
})

describe('buildTopFaceLayout', () => {
  it('returns top strip dimensions for minigt', () => {
    const layout = buildTopFaceLayout('minigt')
    expect(layout.width).toBe(480)
    expect(layout.height).toBe(88)
  })
})

describe('buildSideFaceLayout', () => {
  it('returns side strip dimensions for minigt', () => {
    const layout = buildSideFaceLayout('minigt')
    expect(layout.width).toBe(200)
    expect(layout.height).toBe(220)
  })
})
