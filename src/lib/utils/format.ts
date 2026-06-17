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
