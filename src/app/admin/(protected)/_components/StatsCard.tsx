interface StatsCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  icon: React.ReactNode
  iconBg?: string
}

export function StatsCard({ label, value, sub, accent, icon, iconBg = 'bg-white/5 text-[#F0A500]' }: StatsCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-[#F0A500]/8 border-[#F0A500]/15' : 'bg-[#111118] border-[#1E1E28]'}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-[#F0A500] text-[#0A0A0F]' : iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`font-bold text-2xl leading-none tracking-tight ${accent ? 'text-[#F0A500]' : 'text-[#EEEEF4]'}`}>{value}</p>
      <p className="text-[12px] font-semibold text-[#7A7A90] mt-1">{label}</p>
      {sub && <p className="text-[11px] text-[#404055] mt-2 leading-relaxed">{sub}</p>}
    </div>
  )
}
