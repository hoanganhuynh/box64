const STATUS_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
  pending:   { label: 'Chờ xử lý', dot: 'bg-amber-400',   cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/25' },
  printing:  { label: 'Đang in',   dot: 'bg-blue-400',    cls: 'bg-blue-500/10 text-blue-400 ring-blue-500/25' },
  shipped:   { label: 'Đang giao', dot: 'bg-violet-400',  cls: 'bg-violet-500/10 text-violet-400 ring-violet-500/25' },
  delivered: { label: 'Đã giao',   dot: 'bg-emerald-400', cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/25' },
  cancelled: { label: 'Đã huỷ',   dot: 'bg-red-400',     cls: 'bg-red-500/10 text-red-400 ring-red-500/25' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: 'bg-white/30', cls: 'bg-white/5 text-white/50 ring-white/10' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ring-1 ring-inset ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }))
