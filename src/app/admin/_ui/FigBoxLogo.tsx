export function FigBoxLogo({ className }: { className?: string }) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#111] ${className ?? ''}`}>
      {/* Mark only — viewBox cropped to top portion of logo.svg, FIGBOX text excluded */}
      <svg viewBox="100 0 1068 1100" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <polygon points="1268.44 176.59 1154.8 0 1010.09 22.61 1096.58 155.06 1028.17 334.75 905.28 412.19 972.27 485.67 855.22 789.11 805.96 841.43 243.45 930.96 325.4 1087.16 885.21 999.51 1002.06 876.33 1125.42 552.29 1064.51 484.33 1178.74 412.22 1268.44 176.59" fill="#e54c10" />
        <polygon points="610.58 258.42 526.05 244.19 901.07 186.37 925.04 123.22 874.77 43.74 487.35 104.26 229.07 777.56 263.98 845.67 387.59 827.94 511.72 513.72 788.55 471.16 843.64 332.06 564.89 374.1 610.58 258.42" fill="#ff9100" />
      </svg>
    </div>
  )
}
