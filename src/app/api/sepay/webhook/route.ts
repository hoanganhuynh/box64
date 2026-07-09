import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAndAwardQuests } from '@/lib/gamification/game'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

interface SepayIpnPayload {
  notification_type: string
  order: {
    order_invoice_number: string
    order_status: string
    order_amount: string
  }
}

export async function POST(req: NextRequest) {
  // IPN auth type = SECRET_KEY, configured in my.sepay.vn — SePay sends it back
  // on every callback so we can confirm the request really came from them.
  const secretHeader = req.headers.get('x-secret-key')
  if (!process.env.SEPAY_IPN_SECRET || secretHeader !== process.env.SEPAY_IPN_SECRET) {
    return NextResponse.json({ error: 'Invalid secret key' }, { status: 401 })
  }

  const body = await req.json() as SepayIpnPayload
  const orderId = body.order?.order_invoice_number

  if (body.notification_type === 'ORDER_PAID' && orderId) {
    const { data: updated } = await adminDb()
      .from('orders')
      .update({ payment_status: 'paid', status: 'printing' })
      .eq('id', orderId)
      .select('user_id')
      .maybeSingle()

    // Spin grant happens in the DB trigger; quests are app-side. Best-effort —
    // a quest failure must never make SePay retry the whole IPN.
    if (updated?.user_id) {
      try { await checkAndAwardQuests(updated.user_id) } catch (e) { console.error('quest check failed:', e) }
    }
  }

  return NextResponse.json({ success: true })
}
