import { NextRequest, NextResponse } from 'next/server'
import { sepayClient } from '@/lib/sepay'

// SePay Payment Gateway has no JSON "create order" endpoint — the merchant's
// browser must POST the signed fields directly to SePay's hosted checkout
// page. This route renders a tiny auto-submitting form so the client only
// has to navigate here (window.location.href) instead of building the form.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order')
  const amount = Number(req.nextUrl.searchParams.get('amount'))
  const customerName = req.nextUrl.searchParams.get('name') ?? ''

  if (!orderId || !amount) {
    return NextResponse.json({ error: 'order và amount là bắt buộc' }, { status: 400 })
  }

  const origin = req.nextUrl.origin

  let fields: Record<string, unknown>
  let checkoutUrl: string
  try {
    const client = sepayClient()
    fields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderId,
      order_amount: amount,
      currency: 'VND',
      order_description: `Thanh toan don hang ${orderId}`.slice(0, 100),
      customer_id: customerName || undefined,
      success_url: `${origin}/checkout/success?order=${orderId}`,
      error_url: `${origin}/checkout?error=1&order=${orderId}`,
      cancel_url: `${origin}/checkout?cancelled=1&order=${orderId}`,
    })
    checkoutUrl = client.checkout.initCheckoutUrl()
  } catch (e) {
    console.error('SePay checkout init failed:', e)
    return NextResponse.redirect(`${origin}/checkout?error=1&order=${orderId}`)
  }

  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}" />`)
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8" /><title>Đang chuyển đến trang thanh toán…</title></head>
<body style="background:#07070C;color:#EEEEF4;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Đang chuyển đến trang thanh toán…</p>
  <form id="sepay-form" action="${checkoutUrl}" method="POST">
    ${inputs}
  </form>
  <script>document.getElementById('sepay-form').submit();</script>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
