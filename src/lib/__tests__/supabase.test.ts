import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
  createServerClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('Supabase browser client', () => {
  it('createSupabaseClient returns an object with from()', async () => {
    const { createSupabaseClient } = await import('@/lib/supabase/client')
    const client = createSupabaseClient()
    expect(client).toHaveProperty('from')
  })
})
