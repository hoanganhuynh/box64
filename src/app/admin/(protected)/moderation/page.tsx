'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, ShieldOff } from 'lucide-react'
import {
  getBannedWords, addBannedWord, deleteBannedWord,
  getBannedUsers, unbanUser,
  getRecentComments, deleteComment,
  type BannedWordRow, type BannedUserRow, type RecentCommentRow,
} from './actions'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hôm nay'
  if (d === 1) return 'Hôm qua'
  if (d < 30) return `${d} ngày trước`
  return `${Math.floor(d / 30)} tháng trước`
}

export default function ModerationPage() {
  const [words, setWords] = useState<BannedWordRow[]>([])
  const [bannedUsers, setBannedUsers] = useState<BannedUserRow[]>([])
  const [comments, setComments] = useState<RecentCommentRow[]>([])
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    Promise.all([getBannedWords(), getBannedUsers(), getRecentComments()]).then(([w, u, c]) => {
      setWords(w); setBannedUsers(u); setComments(c); setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  async function handleAddWord(e: React.FormEvent) {
    e.preventDefault()
    if (!newWord.trim()) return
    await addBannedWord(newWord)
    setNewWord('')
    load()
  }

  async function handleDeleteWord(id: string) {
    await deleteBannedWord(id)
    load()
  }

  async function handleUnban(id: string) {
    if (!confirm('Gỡ cấm bình luận cho người dùng này?')) return
    await unbanUser(id)
    load()
  }

  async function handleDeleteComment(id: string) {
    if (!confirm('Xoá bình luận này?')) return
    await deleteComment(id)
    load()
  }

  if (loading) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl mb-6">Kiểm duyệt</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Banned words */}
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-3">
            Từ khoá bị cấm ({words.length})
          </p>
          <form onSubmit={handleAddWord} className="flex gap-2 mb-4">
            <input value={newWord} onChange={e => setNewWord(e.target.value)}
              placeholder="Thêm từ khoá..."
              className="flex-1 h-9 px-3 bg-[#0D0D14] border border-[#1E1E28] rounded-lg text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors" />
            <button type="submit" className="h-9 px-3 rounded-lg bg-[#6366f1] text-white flex items-center gap-1 text-sm font-semibold hover:bg-[#5558e6] transition-colors shrink-0">
              <Plus size={14} /> Thêm
            </button>
          </form>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {words.map(w => (
              <span key={w.id} className="inline-flex items-center gap-1.5 text-sm font-mono text-[#EEEEF4] bg-[#1A1A22] px-2.5 py-1 rounded-lg">
                {w.word}
                <button onClick={() => handleDeleteWord(w.id)} className="text-[#484858] hover:text-red-400 transition-colors">
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
            {words.length === 0 && <p className="text-sm text-[#484858]">Chưa có từ khoá nào.</p>}
          </div>
        </div>

        {/* Banned users */}
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-3">
            Người dùng bị cấm bình luận ({bannedUsers.length})
          </p>
          {bannedUsers.length === 0 ? (
            <p className="text-sm text-[#484858]">Chưa có ai bị cấm.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {bannedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-3 bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#EEEEF4] truncate">{u.full_name ?? u.email ?? u.id}</p>
                    <p className="text-sm text-[#484858]">{u.comment_violations} vi phạm · {u.comment_banned_at ? timeAgo(u.comment_banned_at) : ''}</p>
                  </div>
                  <button onClick={() => handleUnban(u.id)}
                    className="shrink-0 h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/15 transition-colors flex items-center gap-1.5">
                    <ShieldOff size={12} /> Gỡ cấm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent comments */}
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-3">
          Bình luận gần đây ({comments.length})
        </p>
        {comments.length === 0 ? (
          <p className="text-sm text-[#484858]">Chưa có bình luận nào.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#1A1A22]">
            {comments.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#EEEEF4]">{c.user_name ?? 'Ẩn danh'} <span className="text-[#484858] font-normal">· {timeAgo(c.created_at)}</span></p>
                  <p className="text-sm text-[#7A7A90] mt-0.5">{c.content}</p>
                </div>
                <button onClick={() => handleDeleteComment(c.id)}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
