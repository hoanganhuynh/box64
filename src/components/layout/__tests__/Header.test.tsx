import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
  it('renders the brand logo link', () => {
    render(<Header />)
    // Logo link has aria-label="figbox.store — home"
    expect(screen.getByRole('link', { name: /figbox/i })).toBeInTheDocument()
  })

  it('renders a Shop navigation link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /^shop$/i })).toBeInTheDocument()
  })

  it('renders cart link', () => {
    render(<Header />)
    // Cart is a <Link> (anchor), not a <button>
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })
})
