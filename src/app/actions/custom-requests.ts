'use server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface CustomRequestInput {
  name: string
  phone: string
  carModels: string[]
  imageUrls: string[]
  searchQuery?: string
  source: 'search' | 'footer'
}

export interface CustomRequestResult {
  success: boolean
  error?: string
}

export async function submitCustomRequest(input: CustomRequestInput): Promise<CustomRequestResult> {
  if (!input.name.trim() || !input.phone.trim()) {
    return { success: false, error: 'Vui lòng nhập tên và số điện thoại.' }
  }
  const carModels = input.carModels.map(c => c.trim()).filter(Boolean)
  if (!carModels.length) {
    return { success: false, error: 'Vui lòng nhập ít nhất 1 mẫu xe.' }
  }
  const imageUrls = input.imageUrls.map(u => u.trim()).filter(Boolean).slice(0, 3)

  const { error } = await db().from('custom_requests').insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    car_models: carModels,
    image_urls: imageUrls,
    search_query: input.searchQuery?.trim() || null,
    source: input.source,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
