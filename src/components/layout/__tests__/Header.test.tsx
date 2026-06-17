import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../Header'

describe('Header', () => {
  it('renders the brand logo link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /box64/i })).toBeInTheDocument()
  })

  it('renders a Shop navigation link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /^shop$/i })).toBeInTheDocument()
  })

  it('renders cart icon button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument()
  })
})
