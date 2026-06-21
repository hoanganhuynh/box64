import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'FigBox <onboarding@resend.dev>'
const FB_URL = 'https://www.facebook.com/figbox.gr'
const SITE_URL = 'https://figbox.store'

interface Item {
  product_name: string
  quantity: number
  unit_price: number
}

interface Shipping {
  name: string
  phone: string
  line1: string
  ward?: string
  district: string
  city: string
}

interface Payload {
  orderId: string
  customerEmail: string
  customerName: string
  items: Item[]
  shipping: Shipping
  total: number
}

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

function buildHtml(p: Payload): string {
  const firstName = p.customerName.split(' ').pop() ?? p.customerName
  const address = [p.shipping.line1, p.shipping.ward, p.shipping.district, p.shipping.city]
    .filter(Boolean).join(', ')

  const itemRows = p.items.map(i => `
  <tr>
    <td style="padding:14px 24px;border-bottom:1px solid #1C1C26;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#CCCCCC;line-height:1.4">
      ${i.product_name}
    </td>
    <td style="padding:14px 8px;border-bottom:1px solid #1C1C26;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#666666;text-align:center;white-space:nowrap">
      ×${i.quantity}
    </td>
    <td style="padding:14px 24px;border-bottom:1px solid #1C1C26;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#CCCCCC;text-align:right;white-space:nowrap">
      ${vnd(i.unit_price * i.quantity)}
    </td>
  </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Xác nhận đơn hàng ${p.orderId} — FigBox</title>
</head>
<body style="margin:0;padding:0;background-color:#07070C;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#07070C">
<tr><td align="center" style="padding:48px 16px 40px">

  <!-- ══ MAIN CONTAINER ══ -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px">

    <!-- ── LOGO HEADER ── -->
    <tr>
      <td align="center" style="padding-bottom:36px">
        <!-- Gold top accent -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="80" style="height:1px;background:#1C1C26"></td>
            <td style="height:1px;background:#F0A500"></td>
            <td width="80" style="height:1px;background:#1C1C26"></td>
          </tr>
        </table>
        <!-- Logo box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-top:none">
          <tr>
            <td align="center" style="padding:24px 24px 20px">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block">
                <!--[if !mso]><!-->
                <img src="${SITE_URL}/logo.svg" alt="FigBox" width="66" height="72" style="display:block;border:0;outline:none;text-decoration:none;margin:0 auto" />
                <!--<![endif]-->
                <!--[if mso]>
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:#FFFFFF;letter-spacing:-1px;line-height:1">Fig<span style="color:#F0A500">Box</span></p>
                <![endif]-->
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── HERO: ORDER CONFIRMED ── -->
    <tr>
      <td style="padding-bottom:12px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-radius:16px">
          <tr>
            <td align="center" style="padding:40px 32px 36px">

              <!-- Check circle -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px">
                <tr>
                  <td align="center" valign="middle" bgcolor="#1A1505" width="68" height="68"
                      style="width:68px;height:68px;border-radius:50%;border:1.5px solid #F0A500;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;color:#F0A500;line-height:68px;text-align:center">
                    &#10003;
                  </td>
                </tr>
              </table>

              <!-- Status pill -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px">
                <tr>
                  <td bgcolor="#1A1505" style="padding:5px 16px;border-radius:100px;border:1px solid #3D2A00">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#F0A500;letter-spacing:0.2em;text-transform:uppercase">
                      ĐÃ XÁC NHẬN
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#FFFFFF;line-height:1.2">
                Cảm ơn ${firstName}!
              </h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#777777;line-height:1.65;max-width:380px">
                Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ thông báo ngay khi hàng được giao cho đơn vị vận chuyển.
              </p>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── ORDER NUMBER ── -->
    <tr>
      <td style="padding-bottom:12px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-radius:12px">
          <tr>
            <td style="padding:20px 24px">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#444;letter-spacing:0.18em;text-transform:uppercase">Mã đơn hàng</p>
                    <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:0.06em">${p.orderId}</p>
                  </td>
                  <td align="right" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#1A1505" style="padding:6px 14px;border-radius:8px;border:1px solid #2D2000">
                          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#F0A500">Đang xử lý</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── PRODUCTS ── -->
    <tr>
      <td style="padding-bottom:12px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-radius:12px">

          <!-- Section label -->
          <tr>
            <td colspan="3" style="padding:20px 24px 0">
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#444;letter-spacing:0.18em;text-transform:uppercase">
                Sản phẩm
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td colspan="3" style="height:1px;background:#1C1C26;font-size:0;line-height:0"></td></tr>

          <!-- Item rows -->
          ${itemRows}

          <!-- Total row -->
          <tr>
            <td colspan="2" style="padding:18px 24px;background-color:#0A0A14">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF">
                Tổng cộng
              </span>
            </td>
            <td style="padding:18px 24px;background-color:#0A0A14;text-align:right;white-space:nowrap">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#F0A500">
                ${vnd(p.total)}
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- ── SHIPPING ADDRESS ── -->
    <tr>
      <td style="padding-bottom:12px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-radius:12px">
          <tr>
            <td style="padding:20px 24px">
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#444;letter-spacing:0.18em;text-transform:uppercase">
                Giao đến
              </p>
              <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF">
                ${p.shipping.name}
              </p>
              <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#666666">
                ${p.shipping.phone}
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#666666;line-height:1.5">
                ${address}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── DELIVERY INFO ── -->
    <tr>
      <td style="padding-bottom:28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0D0D17" style="border:1px solid #1C1C26;border-radius:12px">
          <tr>
            <td style="padding:16px 20px">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#999999;line-height:1.6">
                <strong style="color:#CCCCCC">Thời gian giao hàng dự kiến:</strong> 3–5 ngày làm việc sau khi xử lý.<br>
                Chúng tôi sẽ gửi email xác nhận khi đơn hàng được bàn giao cho đơn vị vận chuyển.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── SUPPORT ── -->
    <tr>
      <td align="center" style="padding-bottom:36px">
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#555555">
          Có thắc mắc về đơn hàng?
        </p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto">
          <tr>
            <td bgcolor="#1877F2" style="border-radius:10px;padding:13px 28px">
              <a href="${FB_URL}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em">
                Nhắn tin qua Facebook
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── DIVIDER ── -->
    <tr>
      <td style="padding-bottom:24px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="height:1px;background:#1C1C26;font-size:0;line-height:0"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── FOOTER ── -->
    <tr>
      <td align="center">
        <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#333333;letter-spacing:0.1em">
          Fig<span style="color:#F0A500">Box</span>
        </p>
        <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#333333;line-height:1.6">
          <a href="${SITE_URL}" style="color:#555555;text-decoration:none">figbox.store</a>
          &nbsp;·&nbsp;
          <a href="${FB_URL}" style="color:#555555;text-decoration:none">Facebook</a>
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#2A2A2A;line-height:1.6">
          © 2025 FigBox. Email này được gửi tự động — vui lòng không trả lời trực tiếp.
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>

</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const payload: Payload = await req.json()

    if (!payload.customerEmail) {
      return new Response(JSON.stringify({ error: 'No email' }), { status: 400 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.customerEmail,
        subject: `Xác nhận đơn hàng ${payload.orderId} — FigBox`,
        html: buildHtml(payload),
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
