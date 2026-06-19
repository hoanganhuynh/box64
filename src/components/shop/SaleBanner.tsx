import { Zap } from 'lucide-react'

interface Props { message: string }

export default function SaleBanner({ message }: Props) {
  return (
    <div className="bg-gold text-white text-sm font-semibold text-center py-2.5 px-4 flex items-center justify-center gap-2">
      <Zap size={14} className="shrink-0" />
      {message}
    </div>
  )
}
