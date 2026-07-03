# Admin: Notifications, Audit Log, Flash Sale — Design

**Date:** 2026-07-03
**Status:** Approved

Three admin features for the FigBox (box-64) store, approved as a single spec because each is small-medium and they share admin infrastructure (service-role queries, `requireAdmin()` server-action pattern, `_ui` header/sidebar).

Context that shaped the design:

- Admin auth is a custom signed-token cookie (`src/lib/admin-auth.ts`), **not** Supabase Auth. The admin browser session has no Supabase identity, so RLS cannot be used to gate browser-side reads of admin data. All admin data access goes through server actions/queries using the service-role client (`src/lib/admin/queries.ts` pattern).
- Customer auth is Google OAuth via Supabase; there is no `profiles` table — identity lives on `auth.users`.
- `NotificationsDropdown` already exists in `src/app/admin/_ui/` as an empty placeholder wired into the admin header.
- Settings page (`src/app/admin/(protected)/settings/page.tsx`) currently only has the change-password form.
- Promotions today = promo codes (`promo_codes` tables); flash sale is a separate mechanism.

---

## 1. Admin notifications (in-app, realtime)

Notify the admin of: new orders, new product comments, new user registrations.

### Data

New table `admin_notifications`:

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| type | text | `'order' \| 'comment' \| 'user'` |
| title | text | e.g. `Đơn hàng mới FBX-…` |
| body | text nullable | preview: order total / comment excerpt / user email |
| href | text nullable | admin route to navigate to on click |
| read | boolean default false | |
| created_at | timestamptz | index desc |

RLS enabled with **no policies** (service-role only). Retention: a cleanup statement in the fetch path deletes rows older than 30 days (no cron needed).

### Event capture — DB triggers

Triggers are used instead of app-side hooks so every write path is caught (SePay webhook orders, OAuth signups the app never sees):

- `orders` AFTER INSERT → notification `type='order'`, href `/admin/orders/{id}`.
- `product_comments` AFTER INSERT → `type='comment'`, body = first ~80 chars of content, href `/admin/moderation`.
- `auth.users` AFTER INSERT → `type='user'`, body = email, href `/admin/customers`. Function is `security definer` (required to attach to the `auth` schema).

### Realtime without leaking data

The admin browser only holds the anon key, so it must not read `admin_notifications` directly. Instead:

1. The same trigger function sends an **empty signal** — `realtime.send()` broadcast on public channel `admin-notif` with payload `{ type }` only (no content). Worst-case leak: an anonymous subscriber learns *that* an event happened, never *what*.
2. The dropdown subscribes to that channel; on signal (and on window focus, and on mount) it calls a server action `getNotifications()` — gated by `requireAdmin()`, service-role read — to fetch the real rows.

### Server actions (`src/app/admin/(protected)/notifications/actions.ts`)

- `getNotifications()` → latest 20 + unread count (also runs the 30-day cleanup delete).
- `markRead(id)` / `markAllRead()`.

### UI

Upgrade the existing `NotificationsDropdown`:

- Unread-count badge on the bell (hidden at 0, `9+` cap).
- List of latest 20: icon per type, title, body, relative time, unread dot.
- Click row → `markRead` + navigate to `href`.
- "Đánh dấu tất cả đã đọc" button in the dropdown header.
- Empty state stays as today.

---

## 2. Admin audit log (in Settings)

Record every CRUD action performed in the admin, viewable in Settings.

### Data

New table `admin_audit_logs`:

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| admin_email | text | from the verified token |
| action | text | `'create' \| 'update' \| 'delete'` |
| entity_type | text | `product`, `category`, `order`, `promo_code`, `flash_sale`, `settings`, `payment`, `moderation`, … |
| entity_id | text nullable | |
| entity_label | text | human-readable, e.g. product name |
| before | jsonb nullable | snapshot before change (update/delete) |
| after | jsonb nullable | snapshot after change (create/update) |
| created_at | timestamptz | index desc |

RLS enabled, no policies (service-role only).

### Write path

Helper `logAdminAction(entry)` in `src/lib/admin/audit.ts` using the service-role client. Called from **every admin server action** after the mutation succeeds:

- `(protected)/actions.ts` — order status / payment status changes (before/after = the status fields).
- `products`, `categories`, `promotions`, `payment`, `moderation`, `settings` actions — full-row snapshots for before/after (password hash is **redacted** in settings logs).
- New flash-sale actions (feature 3).

Logging is fire-and-forget: a logging failure is `console.error`'d and never fails the parent action. The admin email is obtained by extending the existing `requireAdmin()` pattern to return the verified email.

### UI

Settings page becomes two tabs:

- **Bảo mật** — the existing change-password form, unchanged.
- **Nhật ký hoạt động** — server-fetched table: time, admin, action badge (create=green / update=amber / delete=red), entity label. Filters: entity_type, action. "Tải thêm" pagination (25/page). Clicking a row expands a before/after JSON diff view (only keys that changed, for updates).

Server action `getAuditLogs({ entityType?, action?, page })` gated by `requireAdmin()`.

---

## 3. Flash sale management

Time-boxed discounted prices on selected products with per-item quantity limits, shown on the storefront with countdown and sold-progress.

### Data

```
flash_sales:       id uuid pk, name text, starts_at timestamptz, ends_at timestamptz,
                   active boolean default true, created_at
flash_sale_items:  id uuid pk, flash_sale_id fk cascade, product_id fk,
                   sale_price integer (VND), quantity_limit integer nullable,
                   sold_count integer default 0,
                   unique (flash_sale_id, product_id)
```

A product may appear in overlapping active sales; the **lowest currently-valid sale price wins** (deterministic rule, enforced in the price-resolution query). `sale_price` must be `> 0` and lower than the product's base price (validated in the admin action). RLS: public read is fine (prices are public); writes service-role only.

Atomic sell counter — Postgres function `claim_flash_sale_stock(item_id, qty)`:

```sql
update flash_sale_items
   set sold_count = sold_count + qty
 where id = item_id
   and (quantity_limit is null or sold_count + qty <= quantity_limit)
returning …
```

Returns no row when the claim would oversell → caller falls back to base price for that order.

### Admin

New sidebar entry **"Flash sale"** → `/admin/flash-sales`:

- List of sales with computed status: *Sắp diễn ra / Đang chạy / Đã kết thúc* (+ inactive toggle), item count, time window.
- Create/edit form: name, start/end datetime (validated `starts_at < ends_at`), active toggle, and an item editor — product picker (search by name/SKU), per-item sale price and optional quantity limit, showing base price and % off computed live.
- Delete with confirm.
- All mutations call `logAdminAction` (feature 2).

### Storefront

- Shared resolver `getActiveFlashPrices(productIds)` in `src/lib/storefront/` — returns the winning sale item (price, limit, sold) per product for sales where `active AND now() BETWEEN starts_at AND ends_at`.
- **Homepage**: flash-sale section rendered only while a sale is live — countdown to `ends_at` (client component), product cards with strikethrough base price, sale price, and "Đã bán X/Y" progress bar (only when `quantity_limit` set). Sold-out items show "Hết suất" and revert to base price.
- **Product page & cart**: show sale price + strikethrough while live.
- **Checkout (server truth)**: `placeOrder` re-resolves flash prices server-side (never trusts client prices), calls `claim_flash_sale_stock` per flash item; on claim failure that line reverts to base price. Order items store the actual charged unit price. Promo codes continue to apply to the resulting subtotal exactly as today — no stacking restriction.

### Testing

Vitest units for: price resolution (window boundaries, overlapping sales pick lowest, inactive/expired excluded), oversell claim (limit reached → base price fallback), and admin form validation (`starts_at < ends_at`, `sale_price` below base price).

---

## Error handling summary

- Notification/audit writes never break the parent flow (triggers are `after` + exception-safe; app-side logging is try/caught).
- Flash checkout: claim failure downgrades to base price instead of failing the order; the mismatch is visible in the order's stored unit price.
- Realtime signal loss is tolerated: dropdown also refetches on mount and window focus.

## Out of scope

- Email/push notifications for admin.
- Audit log for actions outside admin server actions (e.g. direct DB edits).
- Flash-sale scheduling automation (auto-create recurring sales).
- Per-user purchase limits within a flash sale.
