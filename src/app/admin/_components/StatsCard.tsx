interface StatsCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  icon: React.ReactNode
}

export function StatsCard({ label, value, sub, accent, icon }: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${accent ? 'bg-[#F0A500]/8 border-[#F0A500]/20' : 'bg-[#0D0D17] border-[#1C1C26]'}`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-[#555] uppercase tracking-[0.18em]">{label}</p>
        <span className={`${accent ? 'text-[#F0A500]' : 'text-[#444]'}`}>{icon}</span>
      </div>
      <div>
        <p className={`font-jakarta font-extrabold text-2xl leading-none ${accent ? 'text-[#F0A500]' : 'text-white'}`}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-[#555] mt-1.5">{sub}</p>}
      </div>
    </div>
  )
}
