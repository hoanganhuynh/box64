import { NextRequest, NextResponse } from 'next/server'
import { PayOS } from '@payos/node'
import { createClient } from '@supabase/supabase-js'

function payos() {
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID!,
    apiKey: process.env.PAYOS_API_KEY!,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
  })
}

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  let webhookData: { orderCode: number; code: string }
  try {
    webhookData = await payos().webhooks.verify(body)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { orderCode, code } = webhookData

  if (code === '00') {
    // Payment success → mark order as paid and move to printing
    await adminDb()
      .from('orders')
      .update({ payment_status: 'paid', status: 'printing' })
      .eq('payos_order_code', orderCode)
  } else if (code === 'CANCELLED') {
    await adminDb()
      .from('orders')
      .update({ payment_status: 'cancelled' })
      .eq('payos_order_code', orderCode)
  }

  return NextResponse.json({ success: true })
}
