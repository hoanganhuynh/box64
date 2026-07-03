export interface FlashSaleItemInput {
  product_id: string
  sale_price: number
  quantity_limit: number | null
  base_price: number
}

export interface FlashSaleInput {
  name: string
  starts_at: string
  ends_at: string
  items: FlashSaleItemInput[]
}

// Returns a Vietnamese error message, or null when valid.
export function validateFlashSale(input: FlashSaleInput): string | null {
  if (!input.name.trim()) return 'Vui lòng nhập tên đợt flash sale.'

  const start = new Date(input.starts_at).getTime()
  const end = new Date(input.ends_at).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
    return 'Thời gian không hợp lệ — bắt đầu phải trước khi kết thúc.'
  }

  if (input.items.length === 0) return 'Chọn ít nhất một sản phẩm.'

  const seen = new Set<string>()
  for (const item of input.items) {
    if (seen.has(item.product_id)) return 'Sản phẩm bị trùng trong danh sách.'
    seen.add(item.product_id)
    if (!Number.isInteger(item.sale_price) || item.sale_price <= 0 || item.sale_price >= item.base_price) {
      return 'Giá sale phải lớn hơn 0 và thấp hơn giá gốc.'
    }
    if (item.quantity_limit !== null && (!Number.isInteger(item.quantity_limit) || item.quantity_limit <= 0)) {
      return 'Số lượng giới hạn phải lớn hơn 0 (hoặc bỏ trống).'
    }
  }
  return null
}
