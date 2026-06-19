export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + '₫'
}

export function formatCountdown(deltaMs: number) {
  const total   = Math.max(0, deltaMs)
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours   = Math.floor((total / 1000 / 60 / 60) % 24)
  const days    = Math.floor(total / 1000 / 60 / 60 / 24)
  return { days, hours, minutes, seconds }
}

export function formatReleaseDate(d: string): string {
  const [y, m] = d.split('-')
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y}`
}
