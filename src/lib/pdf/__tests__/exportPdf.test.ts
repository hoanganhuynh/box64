import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DesignState } from '@/lib/types'

const mockSave = vi.fn()
const mockAddImage = vi.fn()
const mockRect = vi.fn()
const mockSetFillColor = vi.fn()
const mockSetLineWidth = vi.fn()
const mockSetDrawColor = vi.fn()

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function (this: Record<string, unknown>) {
    this.save          = mockSave
    this.addImage      = mockAddImage
    this.rect          = mockRect
    this.setFillColor  = mockSetFillColor
    this.setLineWidth  = mockSetLineWidth
    this.setDrawColor  = mockSetDrawColor
  }),
}))

const MOCK_STATE: DesignState = {
  car_image_url: null, car_name: 'Lamborghini Aventador',
  specs_line: '1:64 Scale · Diecast',
  warning_text: 'WARNING: CHOKING HAZARD',
  logo_variant: 'minigt', custom_logo_url: null,
  bg_color: '#111212', accent_color: '#C9A84C',
  text_color: '#FFFFFF', logo_tint: '#FFFFFF',
  box_size: 'minigt', quantity: 1,
}

describe('getPdfLayout', () => {
  it('returns layout for minigt', async () => {
    const { getPdfLayout } = await import('@/lib/pdf/exportPdf')
    const layout = getPdfLayout('minigt')
    expect(layout.pageW).toBeGreaterThan(0)
    expect(layout.pageH).toBeGreaterThan(0)
    expect(layout.faces).toHaveLength(6)
  })

  it('all faces have positive width and height', async () => {
    const { getPdfLayout } = await import('@/lib/pdf/exportPdf')
    const layout = getPdfLayout('minigt')
    for (const face of layout.faces) {
      expect(face.w).toBeGreaterThan(0)
      expect(face.h).toBeGreaterThan(0)
    }
  })
})

describe('exportBoxPdf', () => {
  const canvasMock = { toDataURL: vi.fn(() => 'data:image/png;base64,FAKE') } as unknown as HTMLCanvasElement

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls jsPDF and calls save', async () => {
    const { exportBoxPdf } = await import('@/lib/pdf/exportPdf')
    await exportBoxPdf(MOCK_STATE, {
      front: canvasMock, top: canvasMock, side: canvasMock,
    })
    expect(mockSave).toHaveBeenCalled()
  })
})
