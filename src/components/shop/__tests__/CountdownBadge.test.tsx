import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CountdownBadge from '../CountdownBadge'

describe('CountdownBadge', () => {
  it('renders label when endDate is in the future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString()
    render(<CountdownBadge label="SALE" endDate={future} />)
    expect(screen.getByText('SALE')).toBeInTheDocument()
  })

  it('renders nothing when endDate is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    const { container } = render(<CountdownBadge label="SALE" endDate={past} />)
    expect(container.firstChild).toBeNull()
  })
})
