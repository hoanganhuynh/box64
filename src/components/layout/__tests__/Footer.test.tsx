import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />)
    expect(screen.getByText(/box64/i)).toBeInTheDocument()
  })

  it('renders track order link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /track order/i })).toBeInTheDocument()
  })

  it('renders design your box link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /design your box/i })).toBeInTheDocument()
  })
})
