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
  const { orderId, amount, description, items } = await req.json() as {
    orderId: string
    amount: number
    description: string
    items: Array<{ name: string; quantity: number; price: number }>
  }

  if (!orderId || !amount) {
    return NextResponse.json({ error: 'orderId và amount là bắt buộc' }, { status: 400 })
  }

  // PayOS requires a positive integer orderCode — use last 9 digits of Unix ms
  const orderCode = parseInt(Date.now().toString().slice(-9))

  const origin = req.nextUrl.origin

  try {
    const link = await payos().paymentRequests.create({
      orderCode,
      amount,
      description: description.slice(0, 25),
      items,
      returnUrl: `${origin}/checkout/success?order=${orderId}`,
      cancelUrl: `${origin}/checkout?cancelled=1`,
    })

    // Persist orderCode so the webhook can look up the order later
    await adminDb()
      .from('orders')
      .update({ payos_order_code: orderCode, payment_method: 'payos' })
      .eq('id', orderId)

    return NextResponse.json({ checkoutUrl: link.checkoutUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'PayOS error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
