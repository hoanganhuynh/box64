interface Props { width: number; height: number }

// Warning label face — mimics actual MiniGT/Poprace side panel (Ages 14+ / CHOKING HAZARD)
export default function FaceBlueB({ width, height }: Props) {
  const fs = Math.round(height * 0.075)   // base font size
  const gold = '#C9A84C'

  return (
    <div
      className="absolute overflow-hidden"
      style={{ left: 0, top: 0, width, height, background: '#0c0c0c' }}
    >
      <div className="flex h-full" style={{ padding: '5px 8px', gap: 10 }}>
        {/* LEFT — Ages */}
        <div className="flex flex-col" style={{ width: '45%', minWidth: 0 }}>
          <p style={{ color: gold, fontSize: fs * 1.6, fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, lineHeight: 1 }}>
            Ages 14+
          </p>
          <div style={{ height: 1, background: gold, marginTop: 3, marginBottom: 4, opacity: 0.7 }} />
          <div style={{ color: gold, fontSize: fs * 0.62, lineHeight: 1.4, opacity: 0.9, fontFamily: 'sans-serif' }}>
            <p>Collector&apos;s model.</p>
            <p>Not suitable for children under 14 years.</p>
            <p style={{ marginTop: 3 }}>Maßstabsgetreues Sammlermodell für Erwachsene. Nicht geeignet für Kinder unter 14 Jahren.</p>
            <p style={{ marginTop: 3 }}>Modèle ornemental à l&apos;échelle pour collectionneurs adultes. Ne convient pas aux enfants de moins de 14 ans.</p>
            <p style={{ marginTop: 3 }}>Modelli da collezione in scala ridotta per adulti. Non adatti a ragazzi di età inferiore a 14 anni.</p>
          </div>
        </div>

        {/* RIGHT — Choking Hazard */}
        <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-1" style={{ marginBottom: 3 }}>
            <span style={{ color: gold, fontSize: fs * 1.4, lineHeight: 1 }}>⚠</span>
            <p style={{ color: gold, fontSize: fs * 1.3, fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, lineHeight: 1 }}>
              WARNING:
            </p>
          </div>
          <p style={{ color: gold, fontSize: fs * 1.05, fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            CHOKING HAZARD
          </p>
          <p style={{ color: gold, fontSize: fs * 0.62, lineHeight: 1.45, opacity: 0.9, fontFamily: 'sans-serif' }}>
            This product is a collector&apos;s model and is not a toy.
            Model contains small parts which may pose a choking hazard if swallowed.
            Please do not touch the model if it is damaged or defective for your own safety.
          </p>
        </div>
      </div>
    </div>
  )
}
