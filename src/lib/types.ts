export type ProductType = 'box_catalog' | 'box_custom' | 'accessory'
export type ProductStatus = 'active' | 'pre_order' | 'out_of_stock'
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

export interface CartItem {
  id: string             // unique per cart line
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  image_url: string
  design?: DesignState   // present for box_custom items
}
