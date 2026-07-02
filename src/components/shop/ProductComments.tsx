'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, AlertTriangle } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getComments, postComment, type CommentRow } from '@/app/actions/comments'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

export default function ProductComments({ productId }: { productId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'error' | 'warning'; message: string } | null>(null)

  useEffect(() => {
    getComments(productId).then(c => { setComments(c); setLoading(false) })
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user))
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setNotice(null)
    const result = await postComment(productId, content)
    setSubmitting(false)

    if (result.success) {
      setContent('')
      getComments(productId).then(setComments)
      return
    }

    if (result.error === 'login_required') {
      setNotice({ type: 'error', message: 'Vui lòng đăng nhập để bình luận.' })
    } else if (result.error === 'banned') {
      setNotice({ type: 'error', message: 'Tài khoản của bạn đã bị cấm bình luận do vi phạm nhiều lần.' })
    } else if (result.error === 'blocked') {
      setContent('')
      if (result.justBanned) {
        setNotice({ type: 'error', message: 'Bình luận vi phạm quy định cộng đồng. Tài khoản của bạn đã bị cấm bình luận do vi phạm lần thứ 4.' })
      } else {
        setNotice({ type: 'warning', message: `Bình luận vi phạm quy định cộng đồng và đã bị chặn. Cảnh báo ${result.violations}/3 — vi phạm lần thứ 4 sẽ bị cấm bình luận.` })
      }
    } else {
      setNotice({ type: 'error', message: 'Có lỗi xảy ra, vui lòng thử lại.' })
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="border-t border-border pt-12 mb-16">
      <div className="mb-6">
        <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-2">
          <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Thảo luận
        </p>
        <h2 id="comments-heading" className="font-display font-extrabold text-primary text-2xl sm:text-3xl flex items-center gap-2.5">
          <MessageCircle size={22} className="text-gold" />
          Bình luận {comments.length > 0 && <span className="text-muted font-normal">({comments.length})</span>}
        </h2>
      </div>

      {/* Comment form */}
      {isAuthed === false ? (
        <div className="bg-surface border border-border rounded-sm px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-muted text-sm">Đăng nhập để tham gia bình luận.</p>
          <Link href="/login" className="text-gold hover:text-gold-mid text-sm font-semibold transition-colors shrink-0">
            Đăng nhập →
          </Link>
        </div>
      ) : isAuthed === true ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này…"
            rows={3}
            maxLength={1000}
            className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
          {notice && (
            <p className={`flex items-center gap-1.5 text-xs mt-2 ${notice.type === 'error' ? 'text-error' : 'text-gold'}`}>
              <AlertTriangle size={12} /> {notice.message}
            </p>
          )}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="h-9 px-5 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang gửi…' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Comments list */}
      {loading ? (
        <p className="text-muted text-sm">Đang tải bình luận…</p>
      ) : comments.length === 0 ? (
        <p className="text-faint text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-3 py-4 first:pt-0">
              <div className="w-9 h-9 rounded-full bg-[#1A1A2E] border border-[#2A2A42] flex items-center justify-center shrink-0 overflow-hidden">
                {c.user_avatar ? (
                  <Image src={c.user_avatar} alt={c.user_name ?? 'User'} width={36} height={36} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gold font-bold text-sm">{(c.user_name ?? '?').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-primary text-sm font-semibold">{c.user_name ?? 'Người dùng ẩn danh'}</p>
                  <span className="text-faint text-xs">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-muted text-sm mt-1 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
