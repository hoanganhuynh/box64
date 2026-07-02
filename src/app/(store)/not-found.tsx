import Link from 'next/link'
import { ArrowRight2 } from 'iconsax-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="text-center max-w-md">
        <p className="font-display font-extrabold text-white/10 text-7xl sm:text-8xl mb-4">404</p>
        <h1 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase mb-3">
          Không tìm thấy trang
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Đường dẫn này không tồn tại hoặc đã bị thay đổi. Thử tìm sản phẩm bạn cần hoặc quay lại cửa hàng.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
          >
            Xem cửa hàng <ArrowRight2 size={14} color="currentColor" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center h-11 px-6 rounded-sm border border-border text-white/70 font-semibold text-sm hover:text-white hover:border-white/30 transition-colors"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
