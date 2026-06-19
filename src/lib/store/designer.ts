import { create } from 'zustand'
import type { DesignState, GreenSymbolItem } from '@/lib/types'

interface DesignerStore extends DesignState {
  step: number
  setField: <K extends keyof DesignState>(key: K, value: DesignState[K]) => void
  setCarImageUrl: (url: string | null) => void
  addGreenSymbol: (sym: GreenSymbolItem) => void
  moveGreenSymbol: (id: string, x: number, y: number) => void
  rotateGreenSymbol: (id: string, delta: number) => void
  removeGreenSymbol: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const DEFAULT_STATE: DesignState = {
  car_image_url:   null,
  car_name:        '',
  specs_line:      '1:64 Scale · Diecast',
  warning_text:    'WARNING: CHOKING HAZARD — Not for children under 3 years.',
  logo_variant:    'minigt',
  custom_logo_url: null,
  bg_color:        '#111212',
  accent_color:    '#C9A84C',
  text_color:      '#FFFFFF',
  logo_tint:       '#FFFFFF',
  box_size:        'minigt',
  quantity:        1,

  car_image_offset_x:  50,
  car_image_offset_y:  50,
  car_image_scale:     1,

  front_lid_symbol:  '/front-lid/asset-1.svg',
  back_lid_symbol:   '/back-lid/asset-1_1.svg',
  front_lid_rotation: 0,
  back_lid_rotation:  0,
  front_lid_flipped:  false,
  back_lid_flipped:   false,

  green_symbols: [],

  spec_engine:       '',
  spec_power:        '',
  spec_torque:       '',
  spec_acceleration: '',
  spec_top_speed:    '',
  spec_bodykit:      '',
  spec_social:       '',
}

export const useDesignerStore = create<DesignerStore>((set) => ({
  ...DEFAULT_STATE,
  step: 1,

  setField: (key, value) => set({ [key]: value }),
  setCarImageUrl: (url) => set({ car_image_url: url }),

  addGreenSymbol: (sym) =>
    set(s => ({ green_symbols: [...s.green_symbols, sym] })),

  moveGreenSymbol: (id, x, y) =>
    set(s => ({
      green_symbols: s.green_symbols.map(sym =>
        sym.id === id ? { ...sym, x, y } : sym
      ),
    })),

  rotateGreenSymbol: (id, delta) =>
    set(s => ({
      green_symbols: s.green_symbols.map(sym =>
        sym.id === id ? { ...sym, rotation: (sym.rotation + delta + 360) % 360 } : sym
      ),
    })),

  removeGreenSymbol: (id) =>
    set(s => ({ green_symbols: s.green_symbols.filter(sym => sym.id !== id) })),

  nextStep: () => set(s => ({ step: Math.min(4, s.step + 1) })),
  prevStep: () => set(s => ({ step: Math.max(1, s.step - 1) })),
  reset:    () => set({ ...DEFAULT_STATE, step: 1 }),
}))
