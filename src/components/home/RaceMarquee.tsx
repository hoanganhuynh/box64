const ITEMS = [
  'Porsche 911 GT3 RS',
  'LB-Works GT-R R35',
  'Pandem GT-R R32 Sunoco',
  'figbox.store',
  '1:64 Custom Box',
  'Guards Red',
  'Sebring 12H Winner',
  'Weissach Package',
  'Roughroads Rallye',
  'Pfaff Motorsports',
  'AO Racing Pink',
  'Cooler Master Macau GP',
  'MiniGT Collector',
  'Handmade · Vietnam',
]

export default function RaceMarquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div
      className="overflow-hidden bg-gold select-none py-2.5"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-4 whitespace-nowrap">
            <span className="font-display font-extrabold text-[#07070C] text-[11px] uppercase tracking-[0.22em]">
              {item}
            </span>
            <span className="text-[#07070C]/35 font-black text-[10px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
