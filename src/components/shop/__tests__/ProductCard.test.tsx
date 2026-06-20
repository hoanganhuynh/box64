import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductCard from '../ProductCard'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1', type: 'box_catalog', name: 'LB Works Lamborghini',
  slug: 'lb-works', price: 149000,
  images: ['https://placehold.co/480x320'], stock: 10, status: 'active',
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('LB Works Lamborghini')).toBeInTheDocument()
  })

  it('renders price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('149.000₫')).toBeInTheDocument()
  })

  it('renders sale badge when promotion present', () => {
    const withPromo: Product = {
      ...mockProduct,
      promotion: {
        id: 'p1', type: 'sale', label: 'SALE 20% OFF', discount_pct: 20,
        starts_at: new Date(Date.now() - 1000).toISOString(),
        ends_at:   new Date(Date.now() + 1000 * 3600).toISOString(),
        product_ids: ['1'], priority: 1,
      },
    }
    render(<ProductCard product={withPromo} />)
    // Card shows "Sale off N%" using discount_pct, not promo.label
    expect(screen.getByText('Sale off 20%')).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    // Card has two links (image + name/price) — verify at least one points to the detail page
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/shop/lb-works')).toBe(true)
  })
})
