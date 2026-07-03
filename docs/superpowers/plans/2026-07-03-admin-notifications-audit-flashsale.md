# Admin Notifications + Audit Log + Flash Sale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three admin features for box-64: an in-app realtime notification bell (new orders / comments / user signups), a full CRUD audit log viewable in Settings, and flash-sale management with quantity limits wired end-to-end to the storefront.

**Architecture:** DB triggers write notifications and broadcast an empty realtime signal (admin browser has no Supabase identity, so content is fetched via admin-cookie-gated server actions using the service-role key). Audit logging is an app-side helper called from every admin server action. Flash sales are new tables whose prices hydrate the *existing* storefront flash-sale UI through `product.promotion`, with server-side re-pricing and an atomic stock-claim RPC at checkout.

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (Postgres, Realtime broadcast, service-role client), Tailwind, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-03-admin-notifications-audit-flashsale-design.md`

---

## Codebase facts the executor must know

- **Admin auth is NOT Supabase Auth.** A signed-token cookie (`admin_session`) carries the admin email. `verifyToken(token)` from `src/lib/admin-auth.ts` returns the email or null. Admin server actions gate with a local `requireAdmin()` (see `src/app/admin/(protected)/actions.ts:7-11`).
- Admin data access uses a **service-role client** created inline per actions file: see `db()` in `src/app/admin/(protected)/products/actions.ts:6-12`. Follow this pattern.
- The admin header already renders `NotificationsDropdown` (`src/app/admin/_ui/NotificationsDropdown.tsx`) — an empty placeholder to be upgraded, not created.
- The storefront **already has flash-sale UI** driven by `product.promotion` (type `'flash_sale'`): `src/components/home/FlashSaleSection.tsx` (currently reads DUMMY data), `src/components/shop/ProductCard.tsx` (countdown badge + progress bar with **fake** hash-based sold counts), `src/components/shop/PriceDisplay.tsx`, `src/components/home/FlashCountdown.tsx`. The work is feeding these real data, not building new UI.
- Cart price: `src/lib/store/cart.ts:51` uses `unit_price: variant ? variant.price : getDiscountedPrice(product)`; `getDiscountedPrice` lives in `src/lib/data/products.ts:360`. **Flash prices do not apply to variant selections** (documented limitation).
- Checkout: `placeOrder` in `src/app/actions/checkout.ts` currently trusts client `unit_price`/`subtotal`. Flash items get server re-priced there.
- Tests: Vitest, `npm run test:run` (all) or `npm run test:run -- <path>` (one file). Aliases: `@/` → `src/`.
- Migrations: SQL files in `supabase/migrations/`, named `YYYYMMDD_name.sql`. They are applied by the user via `supabase db push` or the Supabase SQL editor — each migration task ends with a **STOP checkpoint** asking the user to apply it. Pure-function tests never need the DB.
- UI styling: admin `_ui` components use semantic tokens (`bg-card`, `border-border`, `text-foreground`, `text-muted`, `bg-surface`). Use those, not raw hexes.

---

# Phase 1 — Admin audit log

Built first so the flash-sale actions (Phase 3) can log from day one.

### Task 1: Audit tables, diff util (TDD), and `logAdminAction` helper

**Files:**
- Create: `supabase/migrations/20260703_admin_audit_logs.sql`
- Create: `src/lib/admin/audit-diff.ts`
- Create: `src/lib/admin/__tests__/audit-diff.test.ts`
- Create: `src/lib/admin/audit.ts`

- [ ] **Step 1: Write the migration**

```sql
-- Audit trail for every CRUD action performed in the admin UI.
-- Written app-side by logAdminAction() (service role); no RLS policies on
-- purpose — the admin browser has no Supabase identity, all reads go through
-- admin-cookie-gated server actions.
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null check (action in ('create', 'update', 'delete')),
  entity_type text not null,
  entity_id text,
  entity_label text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_entity_type_idx on admin_audit_logs (entity_type);

alter table admin_audit_logs enable row level security;
```

- [ ] **Step 2: Write the failing test for the diff util**

`src/lib/admin/__tests__/audit-diff.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { diffSnapshots } from '../audit-diff'

describe('diffSnapshots', () => {
  it('returns only changed keys', () => {
    const before = { name: 'A', price: 100, stock: 5 }
    const after = { name: 'A', price: 200, stock: 5 }
    expect(diffSnapshots(before, after)).toEqual({ price: { before: 100, after: 200 } })
  })

  it('includes added and removed keys', () => {
    expect(diffSnapshots({ a: 1 }, { b: 2 })).toEqual({
      a: { before: 1, after: undefined },
      b: { before: undefined, after: 2 },
    })
  })

  it('compares nested values structurally, not by reference', () => {
    expect(diffSnapshots({ tags: ['x'] }, { tags: ['x'] })).toEqual({})
    expect(diffSnapshots({ tags: ['x'] }, { tags: ['y'] })).toEqual({
      tags: { before: ['x'], after: ['y'] },
    })
  })

  it('handles null/missing snapshots (create and delete)', () => {
    expect(diffSnapshots(null, { a: 1 })).toEqual({ a: { before: undefined, after: 1 } })
    expect(diffSnapshots({ a: 1 }, null)).toEqual({ a: { before: 1, after: undefined } })
    expect(diffSnapshots(null, null)).toEqual({})
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- src/lib/admin/__tests__/audit-diff.test.ts`
Expected: FAIL — cannot resolve `../audit-diff`.

- [ ] **Step 4: Implement the diff util**

`src/lib/admin/audit-diff.ts` (client-safe — imported by the Settings UI, so no server imports here):

```ts
export type SnapshotDiff = Record<string, { before: unknown; after: unknown }>

// Shallow key-level diff of two JSON snapshots; values compared structurally.
export function diffSnapshots(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): SnapshotDiff {
  const b = before ?? {}
  const a = after ?? {}
  const keys = new Set([...Object.keys(b), ...Object.keys(a)])
  const diff: SnapshotDiff = {}
  for (const key of keys) {
    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
      diff[key] = { before: b[key], after: a[key] }
    }
  }
  return diff
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- src/lib/admin/__tests__/audit-diff.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Implement `logAdminAction`**

`src/lib/admin/audit.ts`:

```ts
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

export type AuditAction = 'create' | 'update' | 'delete'

export interface AuditEntry {
  action: AuditAction
  entityType: string
  entityId?: string | null
  entityLabel: string
  before?: unknown
  after?: unknown
}

// Fire-and-forget audit write — resolves the admin email from the session
// cookie itself so call sites stay one-liners. A logging failure must never
// fail the parent action.
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const cookieStore = await cookies()
    const email = verifyToken(cookieStore.get(COOKIE_NAME)?.value ?? '') ?? 'unknown'
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const { error } = await db.from('admin_audit_logs').insert({
      admin_email: email,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId != null ? String(entry.entityId) : null,
      entity_label: entry.entityLabel,
      before: entry.before ?? null,
      after: entry.after ?? null,
    })
    if (error) console.error('logAdminAction insert failed:', error.message)
  } catch (e) {
    console.error('logAdminAction threw:', e)
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260703_admin_audit_logs.sql src/lib/admin/audit-diff.ts src/lib/admin/__tests__/audit-diff.test.ts src/lib/admin/audit.ts
git commit -m "feat(admin): audit log table, diff util, logAdminAction helper"
```

- [ ] **Step 8: CHECKPOINT — ask the user to apply the migration**

Tell the user: apply `supabase/migrations/20260703_admin_audit_logs.sql` via `supabase db push` or the Supabase SQL editor. Subsequent tasks in this phase only need it at runtime (not for tests), so work can continue while they do.

### Task 2: Audit log viewer — Settings becomes tabbed

**Files:**
- Modify: `src/app/admin/(protected)/settings/actions.ts` (append)
- Create: `src/app/admin/(protected)/settings/PasswordTab.tsx`
- Create: `src/app/admin/(protected)/settings/AuditLogTab.tsx`
- Modify: `src/app/admin/(protected)/settings/page.tsx` (rewrite into tab switcher)

- [ ] **Step 1: Add `getAuditLogs` server action**

Append to `src/app/admin/(protected)/settings/actions.ts`. Reuse the file's existing `db()` helper if present; if the file has no admin gate helper, add `requireAdmin` exactly as below (copy the imports it needs: `cookies` from `next/headers`, `COOKIE_NAME, verifyToken` from `@/lib/admin-auth`):

```ts
async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export interface AuditLogRow {
  id: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string | null
  entity_label: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  created_at: string
}

const AUDIT_PAGE_SIZE = 25

export async function getAuditLogs(opts: {
  entityType?: string
  action?: string
  page?: number
}): Promise<{ rows: AuditLogRow[]; hasMore: boolean; entityTypes: string[] }> {
  await requireAdmin()
  const page = opts.page ?? 0
  let q = db()
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * AUDIT_PAGE_SIZE, page * AUDIT_PAGE_SIZE + AUDIT_PAGE_SIZE) // one extra row → hasMore
  if (opts.entityType) q = q.eq('entity_type', opts.entityType)
  if (opts.action) q = q.eq('action', opts.action)
  const { data, error } = await q
  if (error) throw new Error(error.message)

  const { data: typeRows } = await db()
    .from('admin_audit_logs')
    .select('entity_type')
    .limit(1000)
  const entityTypes = [...new Set((typeRows ?? []).map(r => r.entity_type))].sort()

  const rows = (data ?? []) as AuditLogRow[]
  return { rows: rows.slice(0, AUDIT_PAGE_SIZE), hasMore: rows.length > AUDIT_PAGE_SIZE, entityTypes }
}
```

- [ ] **Step 2: Extract the existing password form into `PasswordTab.tsx`**

Move everything currently in `src/app/admin/(protected)/settings/page.tsx` (the `'use client'` header, `PasswordInput`, the form logic and JSX inside `SettingsPage`) into a new `src/app/admin/(protected)/settings/PasswordTab.tsx`, renaming the default export component to `PasswordTab`. Do not change any of the moved code — only the component name and file location. Fix the relative import of `changePassword` if needed (it stays `./actions`).

- [ ] **Step 3: Create `AuditLogTab.tsx`**

`src/app/admin/(protected)/settings/AuditLogTab.tsx`:

```tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { getAuditLogs, type AuditLogRow } from './actions'
import { diffSnapshots } from '@/lib/admin/audit-diff'
import { cn } from '@/lib/cn'

const ACTION_STYLE: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-500',
  update: 'bg-amber-500/10 text-amber-500',
  delete: 'bg-red-500/10 text-red-500',
}
const ACTION_LABEL: Record<string, string> = { create: 'Tạo', update: 'Sửa', delete: 'Xóa' }

function DiffView({ row }: { row: AuditLogRow }) {
  const diff = diffSnapshots(row.before, row.after)
  const keys = Object.keys(diff)
  if (keys.length === 0) return <p className="text-sm text-muted px-4 py-3">Không có dữ liệu thay đổi.</p>
  return (
    <div className="px-4 py-3 flex flex-col gap-2 bg-surface/50">
      {keys.map(k => (
        <div key={k} className="text-xs font-mono">
          <span className="font-semibold text-foreground">{k}</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <pre className="whitespace-pre-wrap break-all rounded-lg bg-red-500/5 text-red-400 p-2">
              {JSON.stringify(diff[k].before ?? null, null, 1)}
            </pre>
            <pre className="whitespace-pre-wrap break-all rounded-lg bg-emerald-500/5 text-emerald-500 p-2">
              {JSON.stringify(diff[k].after ?? null, null, 1)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AuditLogTab() {
  const [rows, setRows] = useState<AuditLogRow[]>([])
  const [entityTypes, setEntityTypes] = useState<string[]>([])
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(async (p: number, append: boolean) => {
    setLoading(true)
    try {
      const res = await getAuditLogs({
        entityType: entityType || undefined,
        action: action || undefined,
        page: p,
      })
      setRows(prev => (append ? [...prev, ...res.rows] : res.rows))
      setHasMore(res.hasMore)
      setEntityTypes(res.entityTypes)
    } finally {
      setLoading(false)
    }
  }, [entityType, action])

  useEffect(() => { setPage(0); load(0, false) }, [load])

  const SELECT = 'h-9 px-3 rounded-lg bg-surface border border-border text-sm text-foreground focus:outline-none'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select value={entityType} onChange={e => setEntityType(e.target.value)} className={SELECT}>
          <option value="">Tất cả đối tượng</option>
          {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={action} onChange={e => setAction(e.target.value)} className={SELECT}>
          <option value="">Tất cả hành động</option>
          <option value="create">Tạo</option>
          <option value="update">Sửa</option>
          <option value="delete">Xóa</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        {rows.length === 0 && !loading && (
          <p className="text-sm text-muted text-center py-10">Chưa có hoạt động nào được ghi nhận.</p>
        )}
        {rows.map(row => (
          <div key={row.id} className="border-b border-border last:border-b-0">
            <button
              onClick={() => setOpenId(openId === row.id ? null : row.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors"
            >
              <span className={cn('shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase', ACTION_STYLE[row.action])}>
                {ACTION_LABEL[row.action]}
              </span>
              <span className="text-xs text-muted shrink-0">{row.entity_type}</span>
              <span className="text-sm text-foreground truncate flex-1">{row.entity_label}</span>
              <span className="text-xs text-muted shrink-0 hidden sm:block">{row.admin_email}</span>
              <span className="text-xs text-muted shrink-0">
                {new Date(row.created_at).toLocaleString('vi-VN')}
              </span>
              {openId === row.id ? <CaretUp size={14} className="text-muted shrink-0" /> : <CaretDown size={14} className="text-muted shrink-0" />}
            </button>
            {openId === row.id && <DiffView row={row} />}
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => { const p = page + 1; setPage(p); load(p, true) }}
          disabled={loading}
          className="self-center h-9 px-5 rounded-full border border-border text-sm text-foreground hover:bg-surface transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang tải…' : 'Tải thêm'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `settings/page.tsx` as a tab switcher**

```tsx
'use client'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import PasswordTab from './PasswordTab'
import { AuditLogTab } from './AuditLogTab'

const TABS = [
  { key: 'security', label: 'Bảo mật' },
  { key: 'audit', label: 'Nhật ký hoạt động' },
] as const

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('security')
  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-foreground mb-4">Cài đặt</h1>
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors',
              tab === t.key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'security' ? <PasswordTab /> : <AuditLogTab />}
    </div>
  )
}
```

Note: `PasswordTab` previously rendered its own page padding/heading as `SettingsPage` — when moving it in Step 2, strip any outer page-level wrapper/heading that would now duplicate this page's, keeping just the form card.

- [ ] **Step 5: Verify build and behavior**

Run: `npx tsc --noEmit` — expect no new errors. Then `npm run dev`, open `/admin/settings`: both tabs render, password tab works as before, audit tab shows the empty state (table just created).

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(protected)/settings"
git commit -m "feat(admin): settings tabs with audit log viewer"
```

### Task 3: Instrument every admin server action with `logAdminAction`

**Files (all Modify):**
- `src/app/admin/(protected)/actions.ts`
- `src/app/admin/(protected)/products/actions.ts`
- `src/app/admin/(protected)/categories/actions.ts`
- `src/app/admin/(protected)/promotions/actions.ts`
- `src/app/admin/(protected)/payment/actions.ts`
- `src/app/admin/(protected)/moderation/actions.ts`
- `src/app/admin/(protected)/settings/actions.ts`
- `src/app/admin/(protected)/finance/actions.ts`
- `src/app/admin/(protected)/requests/actions.ts`

General rules for every call site:
1. `import { logAdminAction } from '@/lib/admin/audit'` at the top of each file.
2. Log **after** the mutation succeeds (after the error check / before `revalidatePath`).
3. For updates/deletes, fetch the existing row **before** mutating to get the `before` snapshot; the extra select uses the file's existing `db()` client.
4. `await` the call (it can never throw — it catches internally).

- [ ] **Step 1: `(protected)/actions.ts` — order status changes**

In `updateOrderStatus`, before `dbUpdateStatus`, fetch the current status; after success log:

```ts
import { createClient } from '@supabase/supabase-js'
import { logAdminAction } from '@/lib/admin/audit'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()
  const { data: prev } = await db().from('orders').select('status').eq('id', orderId).single()
  await dbUpdateStatus(orderId, status)
  await logAdminAction({
    action: 'update', entityType: 'order', entityId: orderId,
    entityLabel: `Đơn hàng ${orderId}`,
    before: { status: prev?.status }, after: { status },
  })
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/dashboard')
}
```

And `updatePaymentStatus` in full:

```ts
export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdmin()
  const { data: prev } = await db().from('orders').select('payment_status').eq('id', orderId).single()
  await dbUpdatePaymentStatus(orderId, paymentStatus)
  await logAdminAction({
    action: 'update', entityType: 'order', entityId: orderId,
    entityLabel: `Đơn hàng ${orderId}`,
    before: { payment_status: prev?.payment_status }, after: { payment_status: paymentStatus },
  })
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
}
```

- [ ] **Step 2: `products/actions.ts`**

- `upsertProduct(row)`: before the upsert, `const { data: prev } = await db().from('products').select('*').eq('id', row.id).maybeSingle()`. After success:
  ```ts
  await logAdminAction({
    action: prev ? 'update' : 'create', entityType: 'product', entityId: row.id,
    entityLabel: row.name, before: prev ?? null, after: row,
  })
  ```
- `deleteProduct(id)`: fetch `prev` the same way before deleting; log `{ action: 'delete', entityType: 'product', entityId: id, entityLabel: prev?.name ?? id, before: prev ?? null }`.
- `setPublished(id, published)`: log `{ action: 'update', entityType: 'product', entityId: id, entityLabel: `Sản phẩm ${id}`, before: { published: !published }, after: { published } }`.
- Bulk actions (`bulkDelete`, `bulkSetPublished`, `bulkSetStatus`, `bulkSetType`): one log entry per call, not per row:
  ```ts
  await logAdminAction({
    action: 'delete', entityType: 'product', entityId: null,
    entityLabel: `Xóa hàng loạt ${ids.length} sản phẩm`, before: { ids },
  })
  ```
  For the three `bulkSet*` variants use `action: 'update'`, label `` `Cập nhật hàng loạt ${ids.length} sản phẩm` ``, and `after: { published }` / `{ status }` / `{ type }` respectively.

- [ ] **Step 3: `categories/actions.ts`**

- `upsertCategory(row)`: `prev` via `.select('*').eq('id', row.id).maybeSingle()`; log create/update with `entityType: 'category'`, `entityLabel: row.name`, `before: prev ?? null`, `after: row`.
- `deleteCategory(id)`: fetch `prev`; log delete with `entityLabel: prev?.name ?? id`.

- [ ] **Step 4: `promotions/actions.ts`**

- `upsertPromoCode(row)`: `prev` from `promo_codes` by `row.id` (`maybeSingle`); after the `if (error) return …` check, log create/update, `entityType: 'promo_code'`, `entityLabel: row.code.trim().toUpperCase()`, `before: prev ?? null`, `after: row`.
- `deletePromoCode(id)`: fetch `prev` (`select('*')`); log delete, `entityLabel: prev?.code ?? id`.
- `togglePromoCodeActive(id, active)`: log update, `entityLabel: `Mã ${id}``, `before: { active: !active }`, `after: { active }`.

- [ ] **Step 5: `payment/actions.ts`**

`updateBankSettings(settings)` — after the `if (error) return …` check, before `revalidatePath`:

```ts
export async function updateBankSettings(
  settings: Partial<BankSettings>,
): Promise<{ error?: string }> {
  const { data: prev } = await db()
    .from('bank_settings')
    .select('bank_id, account_number, account_name')
    .eq('id', 1)
    .maybeSingle()
  const { error } = await db()
    .from('bank_settings')
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }
  await logAdminAction({
    action: 'update', entityType: 'payment', entityId: '1',
    entityLabel: 'Cài đặt thanh toán',
    before: prev ?? null, after: settings,
  })
  revalidatePath('/admin/payment')
  return {}
}
```

- [ ] **Step 6: `moderation/actions.ts`**

- `addBannedWord(word)`: log `{ action: 'create', entityType: 'moderation', entityLabel: `Từ cấm: ${word}`, after: { word } }`.
- `deleteBannedWord(id)`: fetch the word first; log delete, `entityLabel: `Từ cấm: ${prev?.word ?? id}``, `before: prev ?? null`.
- `unbanUser(userId)` / `banUserManually(userId)`: log update, `entityType: 'moderation'`, `entityLabel: `User ${userId}``, `after: { comment_banned: false }` (unban) / `{ comment_banned: true }` (ban).
- `deleteComment(id)`: fetch the comment row first; log delete, `entityLabel: `Bình luận của ${prev?.user_name ?? 'user'}``, `before: prev ?? null`.
- `updateAiPrompt(prompt)`: fetch current config; log update, `entityLabel: 'AI moderation prompt'`, `before: { prompt: prev?.prompt }`, `after: { prompt }`.

- [ ] **Step 7: `settings/actions.ts`**

In `changePassword`, after the successful upsert, log with **redacted** snapshots — never the hash:

```ts
await logAdminAction({
  action: 'update', entityType: 'settings',
  entityLabel: 'Đổi mật khẩu admin',
  before: { password: '[redacted]' }, after: { password: '[redacted]' },
})
```

- [ ] **Step 8: `finance/actions.ts`**

- `updateFinanceSettings(settings)`: before the upsert, `const { data: prev } = await db().from('finance_settings').select('print_cost_per_unit, protect_box_cost_per_unit, partner_splits').eq('id', 1).maybeSingle()`. After success:
  ```ts
  await logAdminAction({
    action: 'update', entityType: 'finance', entityId: '1',
    entityLabel: 'Cài đặt tài chính', before: prev ?? null, after: settings,
  })
  ```
- `addFinanceEntry(input)`: after the successful insert:
  ```ts
  await logAdminAction({
    action: 'create', entityType: 'finance',
    entityLabel: `Bút toán ${input.customer_name} · ${input.month}`,
    after: { ...input, source: 'external' },
  })
  ```
- `updateFinanceEntry(id, input)`: before the update, `const { data: prev } = await db().from('finance_entries').select('*').eq('id', id).maybeSingle()`. After success:
  ```ts
  await logAdminAction({
    action: 'update', entityType: 'finance', entityId: id,
    entityLabel: `Bút toán ${input.customer_name}`,
    before: prev ?? null, after: input,
  })
  ```
- `deleteFinanceEntry(id)`: fetch `prev` the same way before deleting; log:
  ```ts
  await logAdminAction({
    action: 'delete', entityType: 'finance', entityId: id,
    entityLabel: `Bút toán ${prev?.customer_name ?? id}`,
    before: prev ?? null,
  })
  ```
- `syncOnlineOrders(month)`: log `{ action: 'create', entityType: 'finance', entityLabel: `Đồng bộ đơn online tháng ${month}`, after: { month, added: result.added } }` (log after computing the result, before returning).

- [ ] **Step 9: `requests/actions.ts`**

- `updateRequestStatus(id, status)`: fetch `prev` status; log update, `entityType: 'custom_request'`, `entityLabel: `Yêu cầu ${id}``, `before: { status: prev?.status }`, `after: { status }`.
- `deleteCustomRequest(id)`: fetch `prev` row; log delete, `entityLabel: `Yêu cầu ${id}``, `before: prev ?? null`.

- [ ] **Step 10: Verify**

Run: `npx tsc --noEmit` — no new errors. Run `npm run test:run` — all green. Manual spot-check with dev server + applied migration: change an order status, see the row appear in Settings → Nhật ký hoạt động with a status diff.

- [ ] **Step 11: Commit**

```bash
git add "src/app/admin/(protected)"
git commit -m "feat(admin): audit-log all admin CRUD server actions"
```

---

# Phase 2 — Admin notifications

### Task 4: Notifications table + DB triggers + realtime signal

**Files:**
- Create: `supabase/migrations/20260703_admin_notifications.sql`

- [ ] **Step 1: Write the migration**

```sql
-- In-app notifications for the admin. Rows are written by DB triggers so every
-- write path is caught (SePay webhook orders, Google OAuth signups the app
-- never sees). RLS with no policies: service-role only — the admin browser has
-- no Supabase identity, content is fetched via admin-cookie-gated actions.
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('order', 'comment', 'user')),
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx on admin_notifications (created_at desc);

alter table admin_notifications enable row level security;

-- Broadcast an EMPTY signal on the public channel 'admin-notif'. Payload
-- carries only the event type — an anonymous subscriber can learn THAT
-- something happened, never WHAT. The client refetches content through a
-- gated server action. realtime.send failures must never break the insert.
create or replace function admin_notif_signal(evt_type text)
returns void language plpgsql as $$
begin
  perform realtime.send(jsonb_build_object('type', evt_type), 'new', 'admin-notif', false);
exception when others then
  null;
end $$;

create or replace function notify_admin_new_order()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'order',
    'Đơn hàng mới ' || new.id,
    coalesce(new.shipping->>'name', '') || ' · ' || new.total::text || '₫',
    '/admin/orders/' || new.id
  );
  perform admin_notif_signal('order');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_order on orders;
create trigger trg_notify_admin_new_order
  after insert on orders
  for each row execute function notify_admin_new_order();

create or replace function notify_admin_new_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'comment',
    'Bình luận mới',
    coalesce(new.user_name, 'Ẩn danh') || ': ' || left(new.content, 80),
    '/admin/moderation'
  );
  perform admin_notif_signal('comment');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_comment on product_comments;
create trigger trg_notify_admin_new_comment
  after insert on product_comments
  for each row execute function notify_admin_new_comment();

-- Trigger on auth.users catches Google OAuth signups. Requires the migration
-- to run as postgres (supabase db push / SQL editor does). security definer so
-- the auth-schema trigger can insert into public.admin_notifications.
create or replace function public.notify_admin_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'user',
    'Người dùng mới đăng ký',
    new.email,
    '/admin/customers'
  );
  perform admin_notif_signal('user');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_user on auth.users;
create trigger trg_notify_admin_new_user
  after insert on auth.users
  for each row execute function public.notify_admin_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260703_admin_notifications.sql
git commit -m "feat(admin): notifications table + triggers for orders/comments/signups"
```

- [ ] **Step 3: CHECKPOINT — ask the user to apply the migration**

Note for the user: if `create trigger … on auth.users` is rejected in their environment, run just that statement in the Supabase SQL editor (runs as postgres, which has rights on `auth.users`).

### Task 5: Notification server actions

**Files:**
- Create: `src/app/admin/(protected)/notifications/actions.ts`

- [ ] **Step 1: Write the actions**

```ts
'use server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export interface AdminNotification {
  id: string
  type: 'order' | 'comment' | 'user'
  title: string
  body: string | null
  href: string | null
  read: boolean
  created_at: string
}

const RETENTION_DAYS = 30

export async function getNotifications(): Promise<{ items: AdminNotification[]; unread: number }> {
  await requireAdmin()
  const client = db()

  // Retention: prune old rows opportunistically on fetch — no cron needed.
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  await client.from('admin_notifications').delete().lt('created_at', cutoff)

  const [listRes, countRes] = await Promise.all([
    client.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(20),
    client.from('admin_notifications').select('id', { count: 'exact', head: true }).eq('read', false),
  ])
  return {
    items: (listRes.data ?? []) as AdminNotification[],
    unread: countRes.count ?? 0,
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await requireAdmin()
  await db().from('admin_notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  await requireAdmin()
  await db().from('admin_notifications').update({ read: true }).eq('read', false)
}
```

- [ ] **Step 2: Verify compile, commit**

Run: `npx tsc --noEmit` — no new errors.

```bash
git add "src/app/admin/(protected)/notifications"
git commit -m "feat(admin): notification fetch/mark-read server actions"
```

### Task 6: Upgrade `NotificationsDropdown` (realtime + badge + list)

**Files:**
- Modify: `src/app/admin/_ui/NotificationsDropdown.tsx` (full rewrite)

- [ ] **Step 1: Rewrite the component**

Keep the existing shell (button styling, framer-motion dropdown, `useClickOutside`) and add data. Full replacement:

```tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShoppingCart, ChatCircle, UserPlus } from '@phosphor-icons/react'
import { useClickOutside } from '../hooks/useClickOutside'
import { createSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/cn'
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  type AdminNotification,
} from '../(protected)/notifications/actions'

const TYPE_ICON = { order: ShoppingCart, comment: ChatCircle, user: UserPlus } as const

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'vừa xong'
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  return `${Math.floor(s / 86400)} ngày trước`
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useClickOutside(ref, () => setOpen(false))

  const refetch = useCallback(() => {
    getNotifications()
      .then(r => { setItems(r.items); setUnread(r.unread) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refetch()
    const onFocus = () => refetch()
    window.addEventListener('focus', onFocus)

    // Empty realtime signal on the public 'admin-notif' channel — the payload
    // has no content; the actual rows come from the gated server action.
    const supabase = createSupabaseClient()
    const channel = supabase
      .channel('admin-notif')
      .on('broadcast', { event: 'new' }, () => refetch())
      .subscribe()

    return () => {
      window.removeEventListener('focus', onFocus)
      supabase.removeChannel(channel)
    }
  }, [refetch])

  async function onItemClick(n: AdminNotification) {
    setOpen(false)
    if (!n.read) {
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, read: true } : i)))
      setUnread(u => Math.max(0, u - 1))
      markNotificationRead(n.id).catch(() => {})
    }
    if (n.href) router.push(n.href)
  }

  async function onMarkAll() {
    setItems(prev => prev.map(i => ({ ...i, read: true })))
    setUnread(0)
    markAllNotificationsRead().catch(() => {})
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Thông báo"
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-surface',
          open ? 'border-indigo-400 bg-surface' : 'border-border',
        )}
      >
        <Bell size={20} weight="regular" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Thông báo</h3>
              {unread > 0 && (
                <button onClick={onMarkAll} className="text-xs text-indigo-400 hover:underline">
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Bell size={24} weight="regular" className="text-muted" />
                <p className="text-sm text-muted">Không có thông báo mới</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {items.map(n => {
                  const Icon = TYPE_ICON[n.type] ?? Bell
                  return (
                    <button
                      key={n.id}
                      onClick={() => onItemClick(n)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface transition-colors border-b border-border last:border-b-0"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-foreground">
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn('block text-sm truncate', n.read ? 'text-muted' : 'text-foreground font-medium')}>
                          {n.title}
                        </span>
                        {n.body && <span className="block text-xs text-muted truncate">{n.body}</span>}
                        <span className="block text-[11px] text-muted mt-0.5">{timeAgo(n.created_at)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

`npx tsc --noEmit`, then dev server (needs the migration applied): place a test order or insert a row into `admin_notifications` via SQL editor — the badge updates without reload (realtime) or at latest on window refocus; clicking navigates and clears the unread dot; "Đánh dấu tất cả đã đọc" zeroes the badge.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/_ui/NotificationsDropdown.tsx
git commit -m "feat(admin): live notifications dropdown with unread badge"
```

---

# Phase 3 — Flash sale

### Task 7: Flash-sale tables + atomic stock RPCs

**Files:**
- Create: `supabase/migrations/20260703_flash_sales.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Flash sales: time-boxed exact sale prices on selected products with optional
-- per-item quantity limits. Public may read (prices are public); writes are
-- service-role only. A product in overlapping active sales takes the LOWEST
-- currently-valid price (enforced in the app-side resolver).
create table if not exists flash_sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table if not exists flash_sale_items (
  id uuid primary key default gen_random_uuid(),
  flash_sale_id uuid not null references flash_sales(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  sale_price integer not null check (sale_price > 0),
  quantity_limit integer check (quantity_limit > 0),
  sold_count integer not null default 0,
  unique (flash_sale_id, product_id)
);

create index if not exists flash_sale_items_product_id_idx on flash_sale_items (product_id);

alter table flash_sales enable row level security;
alter table flash_sale_items enable row level security;
create policy "public read flash_sales" on flash_sales for select using (true);
create policy "public read flash_sale_items" on flash_sale_items for select using (true);

-- Atomic claim: increments sold_count only if the limit allows it; returns the
-- updated row, or no row when the claim would oversell (caller falls back to
-- base price). Single UPDATE = atomic under concurrency.
create or replace function claim_flash_sale_stock(item_id uuid, qty integer)
returns setof flash_sale_items language sql as $$
  update flash_sale_items
     set sold_count = sold_count + qty
   where id = item_id
     and qty > 0
     and (quantity_limit is null or sold_count + qty <= quantity_limit)
  returning *;
$$;

-- Compensating release for when the order insert fails after a claim.
create or replace function release_flash_sale_stock(item_id uuid, qty integer)
returns void language sql as $$
  update flash_sale_items
     set sold_count = greatest(sold_count - qty, 0)
   where id = item_id;
$$;

-- Only the server (service role) may mutate stock counters.
revoke execute on function claim_flash_sale_stock(uuid, integer) from public, anon, authenticated;
revoke execute on function release_flash_sale_stock(uuid, integer) from public, anon, authenticated;
```

- [ ] **Step 2: Commit + CHECKPOINT**

```bash
git add supabase/migrations/20260703_flash_sales.sql
git commit -m "feat(shop): flash sale tables + atomic stock claim RPCs"
```

Ask the user to apply this migration before manual testing of Tasks 9-12 (the unit tests in Tasks 8 and 10 don't need it).

### Task 8: Flash price resolver (TDD on the pure picker)

**Files:**
- Create: `src/lib/storefront/__tests__/flash.test.ts`
- Create: `src/lib/storefront/flash.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/storefront/__tests__/flash.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { pickWinningFlashItems, type FlashItemRow } from '../flash'

function row(over: Partial<FlashItemRow>): FlashItemRow {
  return {
    id: 'i1', product_id: 'p1', sale_price: 100000,
    quantity_limit: null, sold_count: 0,
    starts_at: '2026-07-01T00:00:00Z', ends_at: '2026-07-10T00:00:00Z',
    ...over,
  }
}

describe('pickWinningFlashItems', () => {
  it('maps product to its flash item', () => {
    const m = pickWinningFlashItems([row({})])
    expect(m.get('p1')?.sale_price).toBe(100000)
  })

  it('lowest sale price wins when a product is in overlapping sales', () => {
    const m = pickWinningFlashItems([
      row({ id: 'a', sale_price: 150000 }),
      row({ id: 'b', sale_price: 120000 }),
      row({ id: 'c', sale_price: 180000 }),
    ])
    expect(m.get('p1')?.id).toBe('b')
  })

  it('excludes sold-out items (limit reached)', () => {
    const m = pickWinningFlashItems([row({ quantity_limit: 10, sold_count: 10 })])
    expect(m.has('p1')).toBe(false)
  })

  it('sold-out cheaper item yields to in-stock pricier one', () => {
    const m = pickWinningFlashItems([
      row({ id: 'cheap', sale_price: 90000, quantity_limit: 5, sold_count: 5 }),
      row({ id: 'ok', sale_price: 110000 }),
    ])
    expect(m.get('p1')?.id).toBe('ok')
  })

  it('unlimited items (null limit) are never sold out', () => {
    const m = pickWinningFlashItems([row({ quantity_limit: null, sold_count: 99999 })])
    expect(m.has('p1')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/lib/storefront/__tests__/flash.test.ts`
Expected: FAIL — cannot resolve `../flash`.

- [ ] **Step 3: Implement `src/lib/storefront/flash.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface FlashItemRow {
  id: string
  product_id: string
  sale_price: number
  quantity_limit: number | null
  sold_count: number
  starts_at: string
  ends_at: string
}

// Pure: given currently-live items (time window already filtered in SQL),
// pick one winner per product — lowest price wins, sold-out items excluded.
export function pickWinningFlashItems(rows: FlashItemRow[]): Map<string, FlashItemRow> {
  const map = new Map<string, FlashItemRow>()
  for (const r of rows) {
    if (r.quantity_limit !== null && r.sold_count >= r.quantity_limit) continue
    const cur = map.get(r.product_id)
    if (!cur || r.sale_price < cur.sale_price) map.set(r.product_id, r)
  }
  return map
}

export async function getActiveFlashPrices(productIds?: string[]): Promise<Map<string, FlashItemRow>> {
  const nowIso = new Date().toISOString()
  let q = db()
    .from('flash_sale_items')
    .select('id, product_id, sale_price, quantity_limit, sold_count, flash_sales!inner(active, starts_at, ends_at)')
    .eq('flash_sales.active', true)
    .lte('flash_sales.starts_at', nowIso)
    .gt('flash_sales.ends_at', nowIso)
  if (productIds && productIds.length > 0) q = q.in('product_id', productIds)
  const { data, error } = await q
  if (error || !data) {
    if (error) console.error('getActiveFlashPrices:', error.message)
    return new Map()
  }
  const rows: FlashItemRow[] = data.map(r => {
    const sale = r.flash_sales as unknown as { starts_at: string; ends_at: string }
    return {
      id: r.id, product_id: r.product_id, sale_price: r.sale_price,
      quantity_limit: r.quantity_limit, sold_count: r.sold_count,
      starts_at: sale.starts_at, ends_at: sale.ends_at,
    }
  })
  return pickWinningFlashItems(rows)
}

// True when the claim succeeded; false = would oversell → caller uses base price.
export async function claimFlashStock(itemId: string, qty: number): Promise<boolean> {
  const { data, error } = await db().rpc('claim_flash_sale_stock', { item_id: itemId, qty })
  if (error) {
    console.error('claimFlashStock:', error.message)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

export async function releaseFlashStock(itemId: string, qty: number): Promise<void> {
  const { error } = await db().rpc('release_flash_sale_stock', { item_id: itemId, qty })
  if (error) console.error('releaseFlashStock:', error.message)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/lib/storefront/__tests__/flash.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storefront/flash.ts src/lib/storefront/__tests__/flash.test.ts
git commit -m "feat(shop): flash price resolver with lowest-price-wins picker"
```

### Task 9: Flash-sale validation (TDD) + admin server actions

**Files:**
- Create: `src/lib/admin/__tests__/flash-validate.test.ts`
- Create: `src/lib/admin/flash-validate.ts`
- Create: `src/app/admin/(protected)/flash-sales/actions.ts`

- [ ] **Step 1: Write the failing validation tests**

`src/lib/admin/__tests__/flash-validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateFlashSale, type FlashSaleInput } from '../flash-validate'

function input(over: Partial<FlashSaleInput> = {}): FlashSaleInput {
  return {
    name: 'Sale hè',
    starts_at: '2026-07-05T00:00:00Z',
    ends_at: '2026-07-06T00:00:00Z',
    items: [{ product_id: 'p1', sale_price: 100000, quantity_limit: 10, base_price: 150000 }],
    ...over,
  }
}

describe('validateFlashSale', () => {
  it('accepts a valid input', () => {
    expect(validateFlashSale(input())).toBeNull()
  })
  it('rejects empty name', () => {
    expect(validateFlashSale(input({ name: '  ' }))).toMatch(/tên/i)
  })
  it('rejects starts_at >= ends_at', () => {
    expect(validateFlashSale(input({ ends_at: '2026-07-05T00:00:00Z' }))).toMatch(/thời gian/i)
    expect(validateFlashSale(input({ ends_at: '2026-07-04T00:00:00Z' }))).toMatch(/thời gian/i)
  })
  it('rejects invalid dates', () => {
    expect(validateFlashSale(input({ starts_at: 'abc' }))).toMatch(/thời gian/i)
  })
  it('rejects empty item list', () => {
    expect(validateFlashSale(input({ items: [] }))).toMatch(/sản phẩm/i)
  })
  it('rejects sale price not below base price', () => {
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 150000, quantity_limit: null, base_price: 150000 }],
    }))).toMatch(/giá/i)
  })
  it('rejects non-positive sale price and non-positive limit', () => {
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 0, quantity_limit: null, base_price: 150000 }],
    }))).toMatch(/giá/i)
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 1000, quantity_limit: 0, base_price: 150000 }],
    }))).toMatch(/số lượng/i)
  })
  it('rejects duplicate products', () => {
    expect(validateFlashSale(input({
      items: [
        { product_id: 'p1', sale_price: 1000, quantity_limit: null, base_price: 150000 },
        { product_id: 'p1', sale_price: 2000, quantity_limit: null, base_price: 150000 },
      ],
    }))).toMatch(/trùng/i)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/lib/admin/__tests__/flash-validate.test.ts`
Expected: FAIL — cannot resolve `../flash-validate`.

- [ ] **Step 3: Implement `src/lib/admin/flash-validate.ts`**

```ts
export interface FlashSaleItemInput {
  product_id: string
  sale_price: number
  quantity_limit: number | null
  base_price: number
}

export interface FlashSaleInput {
  name: string
  starts_at: string
  ends_at: string
  items: FlashSaleItemInput[]
}

// Returns a Vietnamese error message, or null when valid.
export function validateFlashSale(input: FlashSaleInput): string | null {
  if (!input.name.trim()) return 'Vui lòng nhập tên đợt flash sale.'

  const start = new Date(input.starts_at).getTime()
  const end = new Date(input.ends_at).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
    return 'Thời gian không hợp lệ — bắt đầu phải trước khi kết thúc.'
  }

  if (input.items.length === 0) return 'Chọn ít nhất một sản phẩm.'

  const seen = new Set<string>()
  for (const item of input.items) {
    if (seen.has(item.product_id)) return 'Sản phẩm bị trùng trong danh sách.'
    seen.add(item.product_id)
    if (!Number.isInteger(item.sale_price) || item.sale_price <= 0 || item.sale_price >= item.base_price) {
      return 'Giá sale phải lớn hơn 0 và thấp hơn giá gốc.'
    }
    if (item.quantity_limit !== null && (!Number.isInteger(item.quantity_limit) || item.quantity_limit <= 0)) {
      return 'Số lượng giới hạn phải lớn hơn 0 (hoặc bỏ trống).'
    }
  }
  return null
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/lib/admin/__tests__/flash-validate.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Write the admin server actions**

`src/app/admin/(protected)/flash-sales/actions.ts`:

```ts
'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'
import { validateFlashSale } from '@/lib/admin/flash-validate'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export interface FlashSaleItemRow {
  id: string
  flash_sale_id: string
  product_id: string
  sale_price: number
  quantity_limit: number | null
  sold_count: number
  products: { name: string; price: number; images: string[] } | null
}

export interface FlashSaleRow {
  id: string
  name: string
  starts_at: string
  ends_at: string
  active: boolean
  created_at: string
  flash_sale_items: FlashSaleItemRow[]
}

export async function getFlashSales(): Promise<FlashSaleRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('flash_sales')
    .select('*, flash_sale_items(*, products(name, price, images))')
    .order('starts_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as FlashSaleRow[]
}

export interface PickerProduct { id: string; name: string; sku: string | null; price: number }

export async function getProductsForPicker(): Promise<PickerProduct[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('products')
    .select('id, name, sku, price')
    .order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as PickerProduct[]
}

export interface UpsertFlashSaleInput {
  id?: string
  name: string
  starts_at: string
  ends_at: string
  active: boolean
  items: Array<{ product_id: string; sale_price: number; quantity_limit: number | null }>
}

export async function upsertFlashSale(input: UpsertFlashSaleInput): Promise<{ error?: string }> {
  await requireAdmin()
  const client = db()

  // Validate against real base prices — never trust the client's copy.
  const ids = input.items.map(i => i.product_id)
  const { data: prods } = await client.from('products').select('id, price').in('id', ids)
  const priceById = new Map((prods ?? []).map(p => [p.id, p.price]))
  if (priceById.size !== ids.length && ids.some(id => !priceById.has(id))) {
    return { error: 'Có sản phẩm không tồn tại.' }
  }
  const validationError = validateFlashSale({
    name: input.name,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    items: input.items.map(i => ({ ...i, base_price: priceById.get(i.product_id)! })),
  })
  if (validationError) return { error: validationError }

  const { data: prev } = input.id
    ? await client.from('flash_sales').select('*, flash_sale_items(*)').eq('id', input.id).maybeSingle()
    : { data: null }

  const salePayload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name.trim(),
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    active: input.active,
  }
  const { data: sale, error } = await client
    .from('flash_sales')
    .upsert(salePayload, { onConflict: 'id' })
    .select('id')
    .single()
  if (error || !sale) return { error: error?.message ?? 'Lưu thất bại.' }

  // Reconcile items: drop removed products, upsert the rest. sold_count is
  // intentionally NOT in the payload so conflict-updates preserve it.
  const keepIds = input.items.map(i => i.product_id)
  const del = client.from('flash_sale_items').delete().eq('flash_sale_id', sale.id)
  const { error: delError } = keepIds.length > 0 ? await del.not('product_id', 'in', `(${keepIds.map(id => `"${id}"`).join(',')})`) : await del
  if (delError) return { error: delError.message }

  const { error: itemsError } = await client.from('flash_sale_items').upsert(
    input.items.map(i => ({
      flash_sale_id: sale.id,
      product_id: i.product_id,
      sale_price: i.sale_price,
      quantity_limit: i.quantity_limit,
    })),
    { onConflict: 'flash_sale_id,product_id' },
  )
  if (itemsError) return { error: itemsError.message }

  await logAdminAction({
    action: prev ? 'update' : 'create',
    entityType: 'flash_sale',
    entityId: sale.id,
    entityLabel: input.name.trim(),
    before: prev ?? null,
    after: { ...salePayload, items: input.items },
  })

  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
  return {}
}

export async function deleteFlashSale(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('flash_sales').select('*, flash_sale_items(*)').eq('id', id).maybeSingle()
  const { error } = await db().from('flash_sales').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'flash_sale', entityId: id,
    entityLabel: prev?.name ?? id, before: prev ?? null,
  })
  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
}

export async function toggleFlashSaleActive(id: string, active: boolean): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('flash_sales').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'flash_sale', entityId: id,
    entityLabel: `Flash sale ${id}`, before: { active: !active }, after: { active },
  })
  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
}
```

- [ ] **Step 6: Verify compile, commit**

Run: `npx tsc --noEmit` — no new errors. `npm run test:run` — all green.

```bash
git add src/lib/admin/flash-validate.ts src/lib/admin/__tests__/flash-validate.test.ts "src/app/admin/(protected)/flash-sales/actions.ts"
git commit -m "feat(admin): flash sale validation + CRUD server actions"
```

### Task 10: Admin flash-sales page + sidebar entry

**Files:**
- Modify: `src/app/admin/_ui/Sidebar.tsx` (add nav item)
- Create: `src/app/admin/(protected)/flash-sales/page.tsx`
- Create: `src/app/admin/(protected)/flash-sales/FlashSalesClient.tsx`

- [ ] **Step 1: Add sidebar entry**

In `src/app/admin/_ui/Sidebar.tsx`, add `Lightning` to the `@phosphor-icons/react` import and insert into the nav array after the 'Khuyến mãi' line (line ~45):

```ts
{ label: 'Flash sale',  href: '/admin/flash-sales', icon: Lightning },
```

- [ ] **Step 2: Server page**

`src/app/admin/(protected)/flash-sales/page.tsx`:

```tsx
import { getFlashSales, getProductsForPicker } from './actions'
import { FlashSalesClient } from './FlashSalesClient'

export const dynamic = 'force-dynamic'

export default async function FlashSalesPage() {
  const [sales, products] = await Promise.all([getFlashSales(), getProductsForPicker()])
  return <FlashSalesClient initialSales={sales} products={products} />
}
```

- [ ] **Step 3: Client component**

`src/app/admin/(protected)/flash-sales/FlashSalesClient.tsx`:

```tsx
'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash, PencilSimple, Lightning, X } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { formatVND } from '@/lib/utils/format'
import {
  upsertFlashSale, deleteFlashSale, toggleFlashSaleActive,
  type FlashSaleRow, type PickerProduct, type UpsertFlashSaleInput,
} from './actions'

type SaleStatus = 'upcoming' | 'running' | 'ended'

function saleStatus(s: { starts_at: string; ends_at: string }): SaleStatus {
  const now = Date.now()
  if (now < new Date(s.starts_at).getTime()) return 'upcoming'
  if (now >= new Date(s.ends_at).getTime()) return 'ended'
  return 'running'
}

const STATUS_CHIP: Record<SaleStatus, { label: string; cls: string }> = {
  upcoming: { label: 'Sắp diễn ra', cls: 'bg-sky-500/10 text-sky-400' },
  running: { label: 'Đang chạy', cls: 'bg-emerald-500/10 text-emerald-500' },
  ended: { label: 'Đã kết thúc', cls: 'bg-zinc-500/10 text-muted' },
}

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ItemDraft { product_id: string; sale_price: number; quantity_limit: number | null }

interface Draft {
  id?: string
  name: string
  starts_at: string // datetime-local value
  ends_at: string
  active: boolean
  items: ItemDraft[]
}

const EMPTY_DRAFT: Draft = { name: '', starts_at: '', ends_at: '', active: true, items: [] }

const INPUT = 'h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-400 w-full'

export function FlashSalesClient({ initialSales, products }: {
  initialSales: FlashSaleRow[]
  products: PickerProduct[]
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products])

  const pickerResults = useMemo(() => {
    if (!draft) return []
    const q = search.trim().toLowerCase()
    if (!q) return []
    const chosen = new Set(draft.items.map(i => i.product_id))
    return products
      .filter(p => !chosen.has(p.id) && (p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)))
      .slice(0, 8)
  }, [draft, search, products])

  function openEdit(sale?: FlashSaleRow) {
    setError('')
    setSearch('')
    if (!sale) { setDraft({ ...EMPTY_DRAFT }); return }
    setDraft({
      id: sale.id,
      name: sale.name,
      starts_at: toLocalInput(sale.starts_at),
      ends_at: toLocalInput(sale.ends_at),
      active: sale.active,
      items: sale.flash_sale_items.map(i => ({
        product_id: i.product_id, sale_price: i.sale_price, quantity_limit: i.quantity_limit,
      })),
    })
  }

  async function onSave() {
    if (!draft) return
    setSaving(true)
    setError('')
    const payload: UpsertFlashSaleInput = {
      id: draft.id,
      name: draft.name,
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : '',
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : '',
      active: draft.active,
      items: draft.items,
    }
    const res = await upsertFlashSale(payload)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setDraft(null)
    router.refresh()
  }

  async function onDelete(sale: FlashSaleRow) {
    if (!confirm(`Xóa flash sale "${sale.name}"?`)) return
    await deleteFlashSale(sale.id)
    router.refresh()
  }

  async function onToggle(sale: FlashSaleRow) {
    await toggleFlashSaleActive(sale.id, !sale.active)
    router.refresh()
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Lightning size={22} weight="bold" className="text-amber-400" /> Flash sale
        </h1>
        <button
          onClick={() => openEdit()}
          className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} weight="bold" /> Tạo đợt sale
        </button>
      </div>

      {initialSales.length === 0 && (
        <p className="text-sm text-muted text-center py-16">Chưa có đợt flash sale nào.</p>
      )}

      <div className="flex flex-col gap-3">
        {initialSales.map(sale => {
          const st = saleStatus(sale)
          const chip = sale.active ? STATUS_CHIP[st] : { label: 'Tắt', cls: 'bg-zinc-500/10 text-muted' }
          return (
            <div key={sale.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0', chip.cls)}>
                  {chip.label}
                </span>
                <span className="font-semibold text-foreground truncate flex-1">{sale.name}</span>
                <span className="text-xs text-muted hidden sm:block">
                  {new Date(sale.starts_at).toLocaleString('vi-VN')} → {new Date(sale.ends_at).toLocaleString('vi-VN')}
                </span>
                <button onClick={() => onToggle(sale)} className="text-xs text-indigo-400 hover:underline shrink-0">
                  {sale.active ? 'Tắt' : 'Bật'}
                </button>
                <button onClick={() => openEdit(sale)} aria-label="Sửa" className="p-2 rounded-full hover:bg-surface text-foreground">
                  <PencilSimple size={15} />
                </button>
                <button onClick={() => onDelete(sale)} aria-label="Xóa" className="p-2 rounded-full hover:bg-surface text-red-400">
                  <Trash size={15} />
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-1">
                {sale.flash_sale_items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="text-foreground truncate flex-1">{item.products?.name ?? item.product_id}</span>
                    <span className="text-muted line-through text-xs">{item.products ? formatVND(item.products.price) : ''}</span>
                    <span className="text-red-400 font-semibold">{formatVND(item.sale_price)}</span>
                    <span className="text-xs text-muted w-24 text-right">
                      {item.quantity_limit != null ? `Đã bán ${item.sold_count}/${item.quantity_limit}` : 'Không giới hạn'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">{draft.id ? 'Sửa flash sale' : 'Tạo flash sale'}</h2>
              <button onClick={() => setDraft(null)} aria-label="Đóng" className="p-2 rounded-full hover:bg-surface text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted block mb-1">Tên đợt sale</label>
                <input className={INPUT} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="VD: Flash sale cuối tuần" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Bắt đầu</label>
                <input type="datetime-local" className={INPUT} value={draft.starts_at} onChange={e => setDraft({ ...draft, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Kết thúc</label>
                <input type="datetime-local" className={INPUT} value={draft.ends_at} onChange={e => setDraft({ ...draft, ends_at: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
                <input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} />
                Kích hoạt
              </label>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted block mb-1">Thêm sản phẩm (tìm theo tên hoặc SKU)</label>
              <input className={INPUT} value={search} onChange={e => setSearch(e.target.value)} placeholder="Gõ để tìm…" />
              {pickerResults.length > 0 && (
                <div className="mt-1 rounded-xl border border-border overflow-hidden">
                  {pickerResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDraft({ ...draft, items: [...draft.items, { product_id: p.id, sale_price: p.price, quantity_limit: null }] })
                        setSearch('')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      <span className="text-foreground truncate flex-1">{p.name}</span>
                      {p.sku && <span className="text-xs text-muted">{p.sku}</span>}
                      <span className="text-xs text-muted">{formatVND(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {draft.items.map((item, idx) => {
                const p = productById.get(item.product_id)
                const base = p?.price ?? 0
                const pct = base > 0 && item.sale_price > 0 && item.sale_price < base
                  ? Math.round((1 - item.sale_price / base) * 100)
                  : null
                return (
                  <div key={item.product_id} className="flex items-center gap-2 rounded-xl border border-border p-2">
                    <span className="text-sm text-foreground truncate flex-1">{p?.name ?? item.product_id}</span>
                    <span className="text-xs text-muted line-through shrink-0">{formatVND(base)}</span>
                    <input
                      type="number" min={1}
                      className={cn(INPUT, 'w-32 shrink-0')}
                      value={item.sale_price || ''}
                      placeholder="Giá sale"
                      onChange={e => {
                        const items = [...draft.items]
                        items[idx] = { ...item, sale_price: Number(e.target.value) }
                        setDraft({ ...draft, items })
                      }}
                    />
                    <span className="text-xs w-12 shrink-0 text-emerald-500 font-semibold">{pct != null ? `-${pct}%` : ''}</span>
                    <input
                      type="number" min={1}
                      className={cn(INPUT, 'w-24 shrink-0')}
                      value={item.quantity_limit ?? ''}
                      placeholder="SL"
                      onChange={e => {
                        const items = [...draft.items]
                        items[idx] = { ...item, quantity_limit: e.target.value === '' ? null : Number(e.target.value) }
                        setDraft({ ...draft, items })
                      }}
                    />
                    <button
                      onClick={() => setDraft({ ...draft, items: draft.items.filter(i => i.product_id !== item.product_id) })}
                      aria-label="Bỏ sản phẩm"
                      className="p-2 rounded-full hover:bg-surface text-red-400 shrink-0"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="h-10 px-4 rounded-full border border-border text-sm text-foreground hover:bg-surface">
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify**

`npx tsc --noEmit`; dev server (migration applied): create a sale with 1-2 products, edit it, toggle, delete; confirm audit entries appear in Settings → Nhật ký hoạt động.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/_ui/Sidebar.tsx "src/app/admin/(protected)/flash-sales"
git commit -m "feat(admin): flash sale management page"
```

### Task 11: Storefront hydration — real flash prices in existing UI

**Files:**
- Modify: `src/lib/types.ts` (extend `Promotion`)
- Modify: `src/lib/storefront/products.ts` (hydrate promotions)
- Modify: `src/lib/data/products.ts` (`getDiscountedPrice` exact price)
- Modify: `src/components/shop/PriceDisplay.tsx` (exact `salePrice` prop)
- Modify: `src/components/shop/ProductCard.tsx` (exact price + real progress)
- Modify: `src/components/home/FlashSaleSection.tsx` (real data source)

- [ ] **Step 1: Extend the `Promotion` type**

In `src/lib/types.ts`, add three optional fields to `interface Promotion`:

```ts
export interface Promotion {
  id: string
  type: PromotionType
  label: string
  discount_pct: number   // 0–100
  starts_at: string      // ISO timestamp
  ends_at: string        // ISO timestamp
  product_ids: string[] | null   // null = sitewide
  priority: number
  sale_price?: number        // exact VND flash price — overrides discount_pct math
  quantity_limit?: number | null  // flash sale: per-item cap (null = unlimited)
  sold_count?: number        // flash sale: units claimed so far
}
```

- [ ] **Step 2: Hydrate flash promotions in `src/lib/storefront/products.ts`**

Add at the top: `import { getActiveFlashPrices } from './flash'` and `import type { Promotion } from '@/lib/types'` (merge with the existing type import). Add this helper below `toProduct`:

```ts
// Attach live flash-sale prices as product.promotion so the existing
// flash-sale UI (ProductCard, PriceDisplay, FlashSaleSection) lights up.
async function attachFlashPromotions(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products
  const flash = await getActiveFlashPrices(products.map(p => p.id))
  if (flash.size === 0) return products
  return products.map(p => {
    const fp = flash.get(p.id)
    if (!fp || fp.sale_price >= p.price) return p
    const promotion: Promotion = {
      id: fp.id,
      type: 'flash_sale',
      label: 'FLASH SALE',
      discount_pct: Math.round((1 - fp.sale_price / p.price) * 100),
      starts_at: fp.starts_at,
      ends_at: fp.ends_at,
      product_ids: null,
      priority: 10,
      sale_price: fp.sale_price,
      quantity_limit: fp.quantity_limit,
      sold_count: fp.sold_count,
    }
    return { ...p, promotion }
  })
}
```

Then wrap the returns of `getAllProducts` and `getProductBySlug`:
- `getAllProducts`: where it currently returns the mapped product array, return `attachFlashPromotions(mapped)` instead (function stays async).
- `getProductBySlug`: after mapping the row to a product, `const [withFlash] = await attachFlashPromotions([product]); return withFlash`.

- [ ] **Step 3: Exact price in `getDiscountedPrice`**

In `src/lib/data/products.ts:360`, prepend the exact-price branch:

```ts
export function getDiscountedPrice(product: Product): number {
  if (!product.promotion) return product.price
  if (product.promotion.sale_price && product.promotion.sale_price < product.price) {
    return product.promotion.sale_price
  }
  if (product.promotion.discount_pct === 0) return product.price
  return Math.round(product.price * (1 - product.promotion.discount_pct / 100))
}
```

- [ ] **Step 4: Exact price in `PriceDisplay`**

`src/components/shop/PriceDisplay.tsx` — add an optional `salePrice` that wins over pct math (keeps all existing callers working):

```tsx
interface Props {
  price: number
  discountPct?: number
  salePrice?: number   // exact sale price — overrides discountPct math
  className?: string
  dark?: boolean
}

export default function PriceDisplay({ price, discountPct, salePrice, className = '', dark = false }: Props) {
  const finalSale = salePrice ?? (discountPct ? Math.round(price * (1 - discountPct / 100)) : undefined)
  if (!finalSale || finalSale >= price) {
    return (
      <span className={`font-semibold ${dark ? 'text-primary' : 'text-ink'} ${className}`}>
        {formatVND(price)}
      </span>
    )
  }
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-error">{formatVND(finalSale)}</span>
      <span className={`line-through text-sm ${dark ? 'text-faint' : 'text-ink-faint'}`}>
        {formatVND(price)}
      </span>
    </span>
  )
}
```

- [ ] **Step 5: `ProductCard` — pass exact price, use real sold counts**

In `src/components/shop/ProductCard.tsx`:

a) Replace the fake-count block (lines ~42-44) with:

```ts
const hasRealFlash = isFlashSale && promo!.quantity_limit != null
const flashTotal = hasRealFlash ? promo!.quantity_limit! : FLASH_TOTAL
const flashSold = (isFlashSale && showFlashProgress)
  ? (hasRealFlash ? Math.min(promo!.sold_count ?? 0, flashTotal) : getFlashSoldCount(product.slug))
  : 0
const flashPct = Math.round((flashSold / flashTotal) * 100)
```

b) In the `PriceDisplay` usage (~line 193), add the exact price:

```tsx
<PriceDisplay
  price={product.price}
  discountPct={isActive && promo!.discount_pct > 0 ? promo!.discount_pct : undefined}
  salePrice={isActive ? promo!.sale_price : undefined}
  dark={dark}
/>
```

c) In the progress-bar block, replace both `FLASH_TOTAL` references (`aria-valuemax` and the `{flashSold}/{FLASH_TOTAL}` text) with `flashTotal`.

- [ ] **Step 6: `FlashSaleSection` — real data**

`src/components/home/FlashSaleSection.tsx`: switch the data source from dummy to storefront and enable the progress bar. Change the imports and the top of the component (the JSX below stays untouched):

```tsx
import { Flash } from 'iconsax-react'
import { getAllProducts } from '@/lib/storefront/products'
import FlashCountdown from './FlashCountdown'
import ProductCard from '@/components/shop/ProductCard'

export default async function FlashSaleSection() {
  const all = await getAllProducts()
  const now = new Date()
  const products = all.filter(p =>
    p.promotion?.type === 'flash_sale' && new Date(p.promotion.ends_at) > now,
  )
  if (products.length === 0) return null
  // …endDate reduce and JSX unchanged…
```

And add `showFlashProgress` to both `ProductCard` usages inside this file: `<ProductCard product={p} variant="light" showFlashProgress />`.

Note: the homepage already calls `getAllProducts()` separately; Next dedupes nothing here, but a second query is acceptable — do not refactor the homepage in this task.

- [ ] **Step 7: Verify**

`npx tsc --noEmit` and `npm run test:run` — green. Dev server with an active flash sale created in Task 10: homepage shows the section with real countdown/prices/progress; the product detail page and cart show the sale price; a product without flash sale is unaffected. With no active sale, the section disappears.

- [ ] **Step 8: Commit**

```bash
git add src/lib/types.ts src/lib/storefront/products.ts src/lib/data/products.ts src/components/shop/PriceDisplay.tsx src/components/shop/ProductCard.tsx src/components/home/FlashSaleSection.tsx
git commit -m "feat(shop): hydrate storefront flash-sale UI with real sale data"
```

### Task 12: Checkout server-side re-pricing (TDD on the claim plan)

**Files:**
- Create: `src/lib/storefront/__tests__/reprice.test.ts`
- Create: `src/lib/storefront/reprice.ts`
- Modify: `src/app/actions/checkout.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/storefront/__tests__/reprice.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { flashClaimPlan } from '../reprice'
import type { FlashItemRow } from '../flash'
import type { CartItem } from '@/lib/types'

function cartItem(over: Partial<CartItem>): CartItem {
  return {
    product_id: 'p1', product_name: 'Box', quantity: 1, unit_price: 150000,
    ...over,
  } as CartItem
}

function flashRow(over: Partial<FlashItemRow>): FlashItemRow {
  return {
    id: 'fi1', product_id: 'p1', sale_price: 100000,
    quantity_limit: 10, sold_count: 0,
    starts_at: '2026-07-01T00:00:00Z', ends_at: '2026-07-10T00:00:00Z',
    ...over,
  }
}

describe('flashClaimPlan', () => {
  it('plans a claim for a flash item', () => {
    const plan = flashClaimPlan([cartItem({ quantity: 2 })], new Map([['p1', flashRow({})]]))
    expect(plan).toEqual([{ index: 0, itemId: 'fi1', qty: 2, salePrice: 100000 }])
  })

  it('skips items without an active flash price', () => {
    expect(flashClaimPlan([cartItem({ product_id: 'p2' })], new Map([['p1', flashRow({})]]))).toEqual([])
  })

  it('skips variant lines — flash prices only apply to the base product', () => {
    const plan = flashClaimPlan(
      [cartItem({ variant_label: 'Custom Poprace' } as Partial<CartItem>)],
      new Map([['p1', flashRow({})]]),
    )
    expect(plan).toEqual([])
  })

  it('plans one claim per matching line', () => {
    const plan = flashClaimPlan(
      [cartItem({}), cartItem({ product_id: 'p2' }), cartItem({ quantity: 3 })],
      new Map([['p1', flashRow({})]]),
    )
    expect(plan.map(p => p.index)).toEqual([0, 2])
    expect(plan[1].qty).toBe(3)
  })
})
```

Note: `CartItem` lives in `src/lib/types.ts` — check its exact fields when writing the test; the `as Partial<CartItem>` / `as CartItem` casts above cover optional fields like `variant_label` if it is typed on the cart item (it is used in `checkout.ts:77`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/lib/storefront/__tests__/reprice.test.ts`
Expected: FAIL — cannot resolve `../reprice`.

- [ ] **Step 3: Implement `src/lib/storefront/reprice.ts`**

```ts
import type { CartItem } from '@/lib/types'
import type { FlashItemRow } from './flash'

export interface FlashClaim {
  index: number      // position in the items array
  itemId: string     // flash_sale_items.id to claim against
  qty: number
  salePrice: number
}

// Pure: which cart lines need a flash-stock claim. Variant lines are skipped —
// flash prices apply to the base product price only.
export function flashClaimPlan(items: CartItem[], flash: Map<string, FlashItemRow>): FlashClaim[] {
  const plan: FlashClaim[] = []
  items.forEach((item, index) => {
    if ((item as { variant_label?: string }).variant_label) return
    const fp = flash.get(item.product_id)
    if (!fp) return
    plan.push({ index, itemId: fp.id, qty: item.quantity, salePrice: fp.sale_price })
  })
  return plan
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/lib/storefront/__tests__/reprice.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire into `placeOrder`**

In `src/app/actions/checkout.ts`:

a) Add imports:

```ts
import { getActiveFlashPrices, claimFlashStock, releaseFlashStock } from '@/lib/storefront/flash'
import { flashClaimPlan } from '@/lib/storefront/reprice'
```

b) Right after the `const { data: { user } } = await supabase.auth.getUser()` line and **before** the discount block, insert:

```ts
  // Flash-sale prices are server truth: re-resolve live prices, atomically
  // claim stock per line, and never trust the client's unit_price for flash
  // items. A failed claim (sold out between cart and checkout) reverts that
  // line to the product's base price.
  const flash = await getActiveFlashPrices(items.map(i => i.product_id))
  const plan = flashClaimPlan(items, flash)
  const claimedStock: Array<{ itemId: string; qty: number }> = []
  if (plan.length > 0) {
    const { data: baseRows } = await supabase
      .from('products')
      .select('id, price')
      .in('id', plan.map(c => items[c.index].product_id))
    const baseById = new Map((baseRows ?? []).map(r => [r.id, r.price]))
    for (const c of plan) {
      const ok = await claimFlashStock(c.itemId, c.qty)
      const base = baseById.get(items[c.index].product_id) ?? items[c.index].unit_price
      if (ok) claimedStock.push({ itemId: c.itemId, qty: c.qty })
      items[c.index] = { ...items[c.index], unit_price: ok ? c.salePrice : base }
    }
    subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  }
```

Also change the `subtotal` parameter from `subtotal: number` to `subtotal: number` but reassignable — i.e. add `let` shadow right at the top of the function body: `// eslint-disable-next-line prefer-const` is NOT needed; instead declare `let subtotal = clientSubtotal` — concretely: rename the parameter to `clientSubtotal` and add `let subtotal = clientSubtotal` as the first line of the body, so the reassignment above compiles. All later references to `subtotal` in the function keep working.

Note: `products` is publicly readable via the anon client used here (the storefront reads it the same way); if the select comes back empty due to RLS, the fallback keeps the client's `unit_price`, which is no worse than today's behavior.

c) In the `if (error)` block after the order insert (line ~104), release any claimed stock before returning:

```ts
  if (error) {
    console.error('placeOrder error:', error)
    for (const c of claimedStock) await releaseFlashStock(c.itemId, c.qty)
    return { success: false, error: error.message }
  }
```

- [ ] **Step 6: Verify**

`npx tsc --noEmit` and `npm run test:run` — green. Manual (migration applied, active sale): place an order for a flash product → order stores the sale `unit_price`, admin flash-sales page shows `sold_count` incremented, homepage progress bar moved. Set `quantity_limit` to the current `sold_count` and order again → order goes through at **base** price.

- [ ] **Step 7: Commit**

```bash
git add src/lib/storefront/reprice.ts src/lib/storefront/__tests__/reprice.test.ts src/app/actions/checkout.ts
git commit -m "feat(shop): server-side flash re-pricing + atomic stock claim at checkout"
```

### Task 13: Final verification

- [ ] **Step 1: Full test suite**

Run: `npm run test:run` — all green.

- [ ] **Step 2: Production build**

Run: `npm run build` — succeeds with no type errors.

- [ ] **Step 3: End-to-end smoke (needs all three migrations applied)**

1. Create a flash sale in `/admin/flash-sales` covering one product, window = now → +2h, limit 3.
2. Storefront homepage shows the section; buy the product; badge on the admin bell appears (realtime or on refocus); notification links to the order.
3. Settings → Nhật ký hoạt động shows the flash-sale create entry and the order-status change after you update it.
4. Comment on a product (logged-in customer) → comment notification arrives.

- [ ] **Step 4: Commit any leftovers, report status**

If dirty: commit. Then summarize to the user what shipped and which manual steps (migrations) remain.
