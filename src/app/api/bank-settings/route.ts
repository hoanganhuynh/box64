import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  const { data } = await db
    .from('bank_settings')
    .select('bank_id, account_number, account_name, qr_image_url')
    .eq('id', 1)
    .single()

  return NextResponse.json(
    data ?? {
      bank_id: process.env.NEXT_PUBLIC_BANK_ID ?? '',
      account_number: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '',
      account_name: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? '',
      qr_image_url: null,
    },
  )
}
