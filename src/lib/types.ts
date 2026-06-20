export type ProductType = 'box_catalog' | 'box_custom' | 'water_decal' | 'accessory_3d'
export type ProductStatus = 'active' | 'pre_order' | 'out_of_stock'
export type CarBrand = 'nissan' | 'porsche' | 'lamborghini' | 'ferrari' | 'mclaren' | 'bmw' | 'toyota' | 'honda' | 'mercedes' | 'audi' | 'other'
export type OrderStatus = 'pending' | 'printing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'vnpay' | 'momo' | 'paypal'
export type PromotionType = 'sale' | 'pre_order' | 'flash_sale'
export type BoxSize = 'minigt' | 'poprace'
export type LogoVariant = 'minigt' | 'poprace' | 'custom'

export interface Product {
  id: string
  type: ProductType
  name: string
  slug: string
  price: number          // VND, integer
  images: string[]
  stock: number
  status: ProductStatus
  promotion?: Promotion
  description?: string
  tags?: Array<'bestseller' | 'new' | 'hot' | 'limited'>
  material?: 'box_only' | 'box_protect'
  brand?: CarBrand
  release_date?: string   // YYYY-MM-DD — kept in data, not rendered in UI
  created_at?: string
}

export interface Promotion {
  id: string
  type: PromotionType
  label: string
  discount_pct: number   // 0–100
  starts_at: string      // ISO timestamp
  ends_at: string        // ISO timestamp
  product_ids: string[] | null   // null = sitewide
  priority: number
}

export interface Address {
  name: string
  line1: string
  city: string
  country: string        // ISO 3166-1 alpha-2 e.g. "VN"
  phone: string
  is_default?: boolean
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  design_data?: DesignState
}

export interface Order {
  id: string
  profile_id: string
  status: OrderStatus
  items: OrderItem[]
  shipping: Address
  total: number
  payment_method: PaymentMethod
  payment_ref?: string
  pdf_url?: string
  tracking_number?: string
  created_at: string
}

export interface GreenSymbolItem {
  id: string
  src: string       // e.g. '/icons/Engine.svg'
  x: number         // % within face (0-100)
  y: number
  rotation: number  // degrees
  scale: number     // 0.5-2.0
}

export interface DesignState {
  car_image_url: string | null
  car_name: string
  specs_line: string
  warning_text: string
  logo_variant: LogoVariant
  custom_logo_url: string | null
  bg_color: string
  accent_color: string
  text_color: string
  logo_tint: string
  box_size: BoxSize
  quantity: number

  // Car image position on Orange face
  car_image_offset_x: number   // 0-100
  car_image_offset_y: number
  car_image_scale: number      // 0.5-2.0

  // Pink lid symbols
  front_lid_symbol: string | null
  back_lid_symbol: string | null
  front_lid_rotation: number   // 0, 90, 180, 270
  back_lid_rotation: number
  front_lid_flipped: boolean
  back_lid_flipped: boolean

  // Green face free symbols
  green_symbols: GreenSymbolItem[]

  // Blue-T specs
  spec_engine: string
  spec_power: string
  spec_torque: string
  spec_acceleration: string
  spec_top_speed: string
  spec_bodykit: string
  spec_social: string
}

export interface Template {
  id: string
  name: string
  logo_variant: LogoVariant
  default_colors: {
    bg_color: string
    accent_color: string
    text_color: string
    logo_tint: string
  }
  preview_url: string
}

export interface Profile {
  id: string             // matches auth.users(id)
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface CartItem {
  id: string             // unique per cart line
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  image_url: string
  design?: DesignState   // present for box_custom items
}
