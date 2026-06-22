import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return new NextResponse('Server error', { status: 500 })

  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

  const header = ['Mã đơn', 'Ngày đặt', 'Tên KH', 'SĐT', 'Địa chỉ', 'Sản phẩm', 'Tạm tính', 'Giảm giá', 'Tổng cộng', 'Thanh toán', 'Trạng thái', 'Ghi chú']

  const rows = (data ?? []).map(o => {
    const items = (o.items ?? [])
      .map((i: { product_name: string; quantity: number; unit_price: number }) => `${i.product_name} x${i.quantity} (${i.unit_price.toLocaleString('vi-VN')}đ)`)
      .join(' | ')
    const address = [o.shipping?.line1, o.shipping?.ward, o.shipping?.district, o.shipping?.city]
      .filter(Boolean).join(', ')
    return [
      o.id,
      new Date(o.created_at).toLocaleDateString('vi-VN'),
      o.shipping?.name ?? '',
      o.shipping?.phone ?? '',
      address,
      items,
      o.subtotal ?? '',
      o.discount ?? 0,
      o.total ?? '',
      o.payment_method ?? '',
      o.status ?? '',
      o.note ?? '',
    ].map(escape).join(',')
  })

  const csv = '﻿' + [header.map(escape).join(','), ...rows].join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="figbox-orders-${date}.csv"`,
    },
  })
}
