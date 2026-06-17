import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PriceDisplay from '../PriceDisplay'

describe('PriceDisplay', () => {
  it('shows original price when no discount', () => {
    render(<PriceDisplay price={149000} />)
    expect(screen.getByText('149.000₫')).toBeInTheDocument()
  })

  it('shows sale price and crossed-out original when discounted', () => {
    render(<PriceDisplay price={149000} discountPct={20} />)
    expect(screen.getByText('119.200₫')).toBeInTheDocument()
    expect(screen.getByText('149.000₫')).toBeInTheDocument()
  })
})
