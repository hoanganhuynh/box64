// Face dimensions derived from demo-area.svg (viewBox 841.89×595.28)
// SVG values: large=286.22×130.12, small=130.12×130.12
// Scale factor 1.1 → fits nicely in 50% column at 1280px screen

export const SCALE = 1.1
export const LW = Math.round(286.22 * SCALE)  // 315 — large face width
export const LH = Math.round(130.12 * SCALE)  // 143 — large face height
export const SW = Math.round(130.12 * SCALE)  // 143 — small face width/height

// Total flat canvas dimensions
export const CANVAS_W = SW + LW + SW   // 601
export const CANVAS_H = LH * 4         // 572

// Absolute positions of each face within the flat canvas
export const FACE_POS = {
  blueT:  { left: SW,      top: 0,       w: LW, h: LH },
  green:  { left: SW,      top: LH,      w: LW, h: LH },
  pinkL:  { left: 0,       top: LH * 2,  w: SW, h: LH },
  orange: { left: SW,      top: LH * 2,  w: LW, h: LH },
  pinkR:  { left: SW + LW, top: LH * 2,  w: SW, h: LH },
  blueB:  { left: SW,      top: LH * 3,  w: LW, h: LH },
} as const

// Icons available for the Green face and Blue-T
export const ICON_LIST = [
  { label: 'Engine',       src: '/icons/Engine.svg' },
  { label: 'Power',        src: '/icons/Power.svg' },
  { label: 'Torque',       src: '/icons/Torque.svg' },
  { label: 'Acceleration', src: '/icons/Acceleration.svg' },
  { label: 'Top Speed',    src: '/icons/Top Speed.svg' },
  { label: 'Bodykit',      src: '/icons/Bodykit.svg' },
  { label: 'Facebook',     src: '/icons/facebook.svg' },
  { label: 'Instagram',    src: '/icons/insta.svg' },
  { label: 'Box',          src: '/icons/box.svg' },
]

// Lid symbol options
export const FRONT_LID_SYMBOLS = [
  { label: 'Symbol 1', src: '/front-lid/asset-1.svg' },
]
export const BACK_LID_SYMBOLS = [
  { label: 'Symbol 1', src: '/back-lid/asset-1_1.svg' },
]

// 3D preview box dimensions (px)
export const BOX3D = { W: 200, H: 90, D: 70 }
