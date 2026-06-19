import { Star1 } from 'iconsax-react'

const REVIEWS = [
  {
    name: 'Minh T.',
    city: 'Hà Nội',
    stars: 5,
    quote: 'Hộp đẹp hơn mong đợi, in rõ nét, màu sắc chuẩn với ảnh gốc. Sẽ order thêm cho bộ sưu tập Porsche của mình.',
  },
  {
    name: 'Hùng P.',
    city: 'TP.HCM',
    stars: 5,
    quote: 'Chất lượng giấy dày dặn, không lo bị vẹo góc khi cất trữ. Rất recommend cho anh em collector.',
  },
  {
    name: 'Long N.',
    city: 'Đà Nẵng',
    stars: 5,
    quote: 'Đóng gói ship cẩn thận, hộp đến tay nguyên vẹn. Shop hỗ trợ nhiệt tình khi mình cần chỉnh sửa thiết kế.',
  },
  {
    name: 'Quân L.',
    city: 'Hà Nội',
    stars: 5,
    quote: 'Mình order hộp cho chiếc GT-R LB Works, kết quả in ra đẹp xuất sắc. Xứng đáng với giá tiền bỏ ra.',
  },
  {
    name: 'Tùng H.',
    city: 'Bình Dương',
    stars: 5,
    quote: 'Lần đầu order custom box, nhân viên hướng dẫn tận tình từng bước. Hộp ra màu chuẩn, chi tiết in sắc nét.',
  },
  {
    name: 'Khánh V.',
    city: 'Hải Phòng',
    stars: 5,
    quote: 'Đã order 3 lần rồi, lần nào cũng hài lòng. Chất lượng ổn định, giao đúng hẹn như đồng hồ.',
  },
  {
    name: 'Nam T.',
    city: 'Cần Thơ',
    stars: 5,
    quote: 'Tặng bạn bè chiếc hộp custom theo ảnh xe của họ — ai cũng thích mê. Quà tặng ý nghĩa nhất cho dân model car.',
  },
  {
    name: 'Bảo H.',
    city: 'Hà Nội',
    stars: 5,
    quote: 'Giấy dày, cứng, không bị nhão. Góc gấp sắc và thẳng. Clearly handmade with care — xứng tầm collector.',
  },
  {
    name: 'Sơn P.',
    city: 'TP.HCM',
    stars: 5,
    quote: 'Màu in bắt mắt, finesse đúng nghĩa. Mình là designer nên biết họ xử lý file rất cẩn thận, không sai chi tiết nào.',
  },
  {
    name: 'Đức N.',
    city: 'Vũng Tàu',
    stars: 5,
    quote: 'Ship nhanh, đóng gói an toàn. Mở hộp ra cảm giác như unboxing một sản phẩm luxury thật sự. Sẽ mua thêm!',
  },
]

export default function ReviewsStrip() {
  return (
    <section aria-labelledby="reviews-heading" className="bg-bg py-14 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-2">Collector Community</p>
          <h2 id="reviews-heading" className="font-jakarta font-extrabold text-primary text-2xl">
            What Collectors Say
          </h2>
        </div>

        {/* Scrollable row on all screens */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {REVIEWS.map((r, i) => (
            <article
              key={i}
              className="flex-none w-[280px] sm:w-[300px] snap-start bg-surface border border-border rounded-sm p-5 flex flex-col gap-3"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <Star1 key={s} size={13} color="var(--gold)" variant="Bold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-muted text-sm leading-relaxed flex-1">
                &ldquo;{r.quote}&rdquo;
              </blockquote>

              {/* Reviewer */}
              <footer className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-header border border-border flex items-center justify-center text-gold font-bold text-xs shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-primary text-xs font-semibold">{r.name}</p>
                  <p className="text-faint text-[10px]">{r.city}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Scroll hint */}
        <p className="text-center text-faint text-[10px] mt-3">← Swipe to see more →</p>
      </div>
    </section>
  )
}
