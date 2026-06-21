const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Chờ xử lý',   cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  shipped:   { label: 'Đang giao',   cls: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  delivered: { label: 'Đã giao',     cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  cancelled: { label: 'Đã huỷ',     cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-white/10 text-white/60 border-white/10' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }))
