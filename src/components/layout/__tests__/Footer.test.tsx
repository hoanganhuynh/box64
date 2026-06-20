import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />)
    // Logo img has alt="figbox.store"
    expect(screen.getByAltText(/figbox/i)).toBeInTheDocument()
  })

  it('renders track order link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /track order/i })).toBeInTheDocument()
  })

  it('renders Facebook link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /figbox\.gr/i })).toBeInTheDocument()
  })
})
