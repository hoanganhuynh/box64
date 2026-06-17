import type { DesignState, BoxSize } from '@/lib/types'

const BOX_DIMS: Record<BoxSize, {
  front: [number, number]
  top:   [number, number]
  side:  [number, number]
}> = {
  minigt:  { front: [480, 220], top: [480, 88],  side: [200, 220] },
  poprace: { front: [460, 240], top: [460, 96],  side: [220, 240] },
}

export function buildFrontFaceLayout(size: BoxSize) {
  const [width, height] = BOX_DIMS[size].front
  return { width, height }
}
export function buildTopFaceLayout(size: BoxSize) {
  const [width, height] = BOX_DIMS[size].top
  return { width, height }
}
export function buildSideFaceLayout(size: BoxSize) {
  const [width, height] = BOX_DIMS[size].side
  return { width, height }
}

// ─── FRONT FACE ───
export async function drawFrontFace(
  ctx: CanvasRenderingContext2D,
  state: DesignState,
  carImage: HTMLImageElement | null,
) {
  const { width, height } = buildFrontFaceLayout(state.box_size)
  ctx.clearRect(0, 0, width, height)

  // Background
  ctx.fillStyle = state.bg_color
  ctx.fillRect(0, 0, width, height)

  // Accent stripe
  const stripeX = width - 72
  ctx.fillStyle = state.accent_color
  ctx.globalAlpha = 0.9
  ctx.fillRect(stripeX, 8, 2.5, height - 16)
  ctx.fillRect(stripeX + 5, 8, 0.8, height - 16)
  ctx.globalAlpha = 1

  // Car image (left area)
  if (carImage) {
    const area = { x: 16, y: 20, w: width * 0.55, h: height - 40 }
    const scale = Math.min(area.w / carImage.width, area.h / carImage.height)
    const dw = carImage.width * scale
    const dh = carImage.height * scale
    ctx.drawImage(carImage, area.x + (area.w - dw) / 2, area.y + (area.h - dh) / 2, dw, dh)
  }

  // Car name
  if (state.car_name) {
    ctx.fillStyle = state.text_color
    ctx.font = `bold ${Math.round(height * 0.14)}px "Barlow Condensed", sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(state.car_name.toUpperCase(), 14, height - 22, width * 0.73)
  }

  // Specs line
  if (state.specs_line) {
    ctx.fillStyle = state.text_color
    ctx.globalAlpha = 0.5
    ctx.font = `600 ${Math.round(height * 0.08)}px "Plus Jakarta Sans", sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(state.specs_line, 14, height - 6, width * 0.7)
    ctx.globalAlpha = 1
  }

  // Logo (canvas text — brand protection)
  drawLogoText(ctx, state, stripeX + 8, 8, width - stripeX - 10, 64)

  // Warning (tiny, bottom-right)
  if (state.warning_text) {
    ctx.fillStyle = state.text_color
    ctx.globalAlpha = 0.18
    ctx.font = `500 ${Math.round(height * 0.052)}px "Plus Jakarta Sans", sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('⚠ ' + state.warning_text.substring(0, 60), width - 6, height - 5, 190)
    ctx.globalAlpha = 1
  }
}

// ─── TOP FACE ───
export function drawTopFace(ctx: CanvasRenderingContext2D, state: DesignState) {
  const { width, height } = buildTopFaceLayout(state.box_size)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = lighten(state.bg_color, 0.12)
  ctx.fillRect(0, 0, width, height)

  if (state.car_name) {
    ctx.fillStyle = state.text_color
    ctx.globalAlpha = 0.65
    ctx.font = `bold ${Math.round(height * 0.38)}px "Barlow Condensed", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(state.car_name.toUpperCase(), width / 2, height / 2, width - 24)
    ctx.globalAlpha = 1
  }
}

// ─── SIDE FACE ───
export function drawSideFace(ctx: CanvasRenderingContext2D, state: DesignState) {
  const { width, height } = buildSideFaceLayout(state.box_size)
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = darken(state.bg_color, 0.22)
  ctx.fillRect(0, 0, width, height)

  // Accent bar top edge
  ctx.fillStyle = state.accent_color
  ctx.globalAlpha = 0.55
  ctx.fillRect(0, 0, width, 2)
  ctx.globalAlpha = 1

  if (state.car_name) {
    ctx.save()
    ctx.fillStyle = state.text_color
    ctx.globalAlpha = 0.55
    ctx.font = `bold ${Math.round(width * 0.18)}px "Barlow Condensed", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.translate(width / 2, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(state.car_name.toUpperCase(), 0, 0, height - 20)
    ctx.restore()
    ctx.globalAlpha = 1
  }
}

// ─── LOGO TEXT (canvas-rendered for brand protection) ───
function drawLogoText(
  ctx: CanvasRenderingContext2D,
  state: DesignState,
  x: number, y: number, maxW: number, maxH: number,
) {
  const lines: Record<string, string[]> = {
    minigt:  ['MINI', 'GT™'],
    poprace: ['POP', 'RACE'],
    custom:  [state.car_name?.split(' ')[0]?.toUpperCase() ?? ''],
  }
  ctx.fillStyle = state.logo_tint
  ctx.textAlign = 'right'
  ;(lines[state.logo_variant] ?? []).forEach((line, i) => {
    ctx.font = `900 ${Math.round(maxH * 0.36)}px "Barlow Condensed", sans-serif`
    ctx.textBaseline = 'top'
    ctx.fillText(line, x + maxW, y + i * maxH * 0.38, maxW)
  })
}

// ─── COLOR HELPERS ───
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}
function lighten(hex: string, amt: number): string {
  try { const [r,g,b] = hexToRgb(hex); return rgbToHex(r + Math.round(amt*255), g + Math.round(amt*255), b + Math.round(amt*255)) } catch { return hex }
}
function darken(hex: string, amt: number): string {
  try { const [r,g,b] = hexToRgb(hex); return rgbToHex(r - Math.round(amt*255), g - Math.round(amt*255), b - Math.round(amt*255)) } catch { return hex }
}
