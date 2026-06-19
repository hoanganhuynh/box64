interface Props {
  current: number
  total: number
  labels?: string[]
}

export default function StepIndicator({ current, total, labels }: Props) {
  return (
    <div className="flex items-center justify-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center">
            {/* circle */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  active  ? 'bg-gold text-white shadow-md scale-110' :
                  done    ? 'bg-success text-white' :
                            'bg-surface border-2 border-border text-faint',
                ].join(' ')}
              >
                {done ? '✓' : n}
              </div>
              {labels?.[i] && (
                <span className={`mt-1 text-[10px] whitespace-nowrap ${active ? 'text-gold font-semibold' : 'text-faint'}`}>
                  {labels[i]}
                </span>
              )}
            </div>
            {/* connector */}
            {n < total && (
              <div className={`h-px w-10 mx-1 mb-5 transition-colors ${done ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
