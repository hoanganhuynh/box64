import { Star1 } from 'iconsax-react'
import { REVIEWS } from '@/lib/data/reviews'

export default function ReviewsStrip() {
  return (
    <section aria-labelledby="reviews-heading" className="bg-bg py-14 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-gold text-xs font-bold tracking-widest uppercase mb-2">
            <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Collector Community
          </p>
          <h2 id="reviews-heading" className="font-display font-extrabold text-primary text-3xl sm:text-4xl">
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
              className="flex-none w-[280px] sm:w-[300px] snap-start bg-surface border border-border rounded-xl p-5 flex flex-col gap-3"
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
                <div className="w-9 h-9 rounded-full bg-[#1A1A2E] border border-[#2A2A42] flex items-center justify-center text-gold font-bold text-xs shrink-0">
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
