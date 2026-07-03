'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, ShieldOff } from 'lucide-react'
import {
  getBannedWords, addBannedWord, deleteBannedWord,
  getBannedUsers, unbanUser, banUserManually,
  getRecentComments, deleteComment,
  getAiConfig, updateAiPrompt,
  getModerationLogs,
  type BannedWordRow, type BannedUserRow, type RecentCommentRow, type AiConfig, type ModerationLogRow,
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
  const [logs, setLogs] = useState<ModerationLogRow[]>([])
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [newWord, setNewWord] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'comments' | 'ai' | 'words' | 'users' | 'logs'>('comments')

  function load() {
    Promise.all([getBannedWords(), getBannedUsers(), getRecentComments(), getAiConfig(), getModerationLogs()]).then(([w, u, c, ai, l]) => {
      setWords(w); setBannedUsers(u); setComments(c); 
      setAiConfig(ai)
      setLogs(l)
      if (ai) setAiPrompt(ai.system_prompt)
      setLoading(false)
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

  async function handleBanUser(userId: string) {
    if (!confirm('Cấm người dùng này bình luận ngay lập tức?')) return
    await banUserManually(userId)
    load()
  }

  async function handleSavePrompt() {
    if (!aiPrompt.trim()) return
    setSavingPrompt(true)
    try {
      await updateAiPrompt(aiPrompt)
      load()
      alert('Đã cập nhật Rule AI thành công!')
    } catch (e: any) {
      alert('Lỗi: ' + e.message)
    } finally {
      setSavingPrompt(false)
    }
  }

  if (loading) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl mb-6">Kiểm duyệt</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#1E1E28] pb-4">
        {[
          { id: 'comments', label: 'Bình luận gần đây' },
          { id: 'logs', label: 'Nhật ký kiểm duyệt' },
          { id: 'ai', label: 'Cấu hình AI' },
          { id: 'words', label: 'Từ khoá bị cấm' },
          { id: 'users', label: 'Người dùng bị cấm' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#6366f1] text-white'
                : 'text-[#7A7A90] hover:text-[#EEEEF4] hover:bg-[#1A1A22]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'words' && (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5 mb-4">
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
      )}

      {activeTab === 'users' && (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5 mb-4">
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
      )}

      {activeTab === 'ai' && (
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">
            Cấu hình AI DeepSeek
          </p>
          <div className="text-sm text-[#484858]">
            Tổng Token tiêu thụ: <span className="font-mono text-[#EEEEF4]">{aiConfig?.total_tokens_used?.toLocaleString() ?? 0}</span>
          </div>
        </div>
        <textarea
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          className="w-full h-40 bg-[#0D0D14] border border-[#1E1E28] rounded-lg p-3 text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors mb-3 font-mono"
          placeholder="Nhập System Prompt cho AI..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleSavePrompt}
            disabled={savingPrompt}
            className="h-9 px-4 rounded-lg bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors disabled:opacity-50"
          >
            {savingPrompt ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
        </div>
      )}

      {activeTab === 'logs' && (
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-0 overflow-hidden flex flex-col mb-4">
        <div className="p-5 pb-4 border-b border-[#1E1E28]">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">
            Nhật ký kiểm duyệt ({logs.length})
          </p>
        </div>
        {logs.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-[#484858]">Chưa có lịch sử kiểm duyệt nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#0D0D14]/50 border-b border-[#1E1E28]">
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[15%]">Thời gian</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[15%]">Người dùng</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[40%]">Nội dung</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[10%]">Trạng thái</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[20%]">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-[#1A1A22]/50 transition-colors">
                    <td className="py-4 px-5 align-top">
                      <p className="text-xs text-[#7A7A90] whitespace-nowrap">{new Date(log.created_at).toLocaleString('vi-VN')}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="text-sm font-semibold text-[#EEEEF4] truncate">{log.user_name ?? log.user_email ?? 'Ẩn danh'}</p>
                      <a href={`/shop/${log.product_slug}`} target="_blank" className="text-xs text-[#6366f1] hover:underline mt-1 block truncate">
                        {log.product_name}
                      </a>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="text-sm text-[#EEEEF4] leading-relaxed break-words whitespace-pre-wrap">{log.content}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                      {log.action === 'ALLOWED' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400">Đã duyệt</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-400">Đã chặn</span>
                      )}
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="text-sm text-[#EEEEF4] break-words">{log.reason || '-'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {activeTab === 'comments' && (
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-0 overflow-hidden flex flex-col">
        <div className="p-5 pb-4 border-b border-[#1E1E28]">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">
            Bình luận gần đây ({comments.length})
          </p>
        </div>
        {comments.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-[#484858]">Chưa có bình luận nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#0D0D14]/50 border-b border-[#1E1E28]">
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[35%]">Sản phẩm</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[20%]">Người dùng</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[35%]">Nội dung</th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#484858] uppercase tracking-wider w-[10%] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {comments.map(c => (
                  <tr key={c.id} className="hover:bg-[#1A1A22]/50 transition-colors group/row">
                    <td className="py-4 px-5 align-top">
                      <a href={`/shop/${c.product_slug}`} target="_blank" className="flex items-start gap-3 group/link">
                        <div className="w-12 h-12 rounded-lg bg-[#1A1A22] border border-[#1E1E28] overflow-hidden shrink-0">
                          {c.product_image ? (
                            <img src={c.product_image} alt="" className="w-full h-full object-cover group-hover/link:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#484858]">No Img</div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-[#EEEEF4] group-hover/link:text-[#6366f1] transition-colors line-clamp-2 mt-0.5">
                          {c.product_name}
                        </span>
                      </a>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="text-sm font-semibold text-[#EEEEF4]">{c.user_name ?? 'Ẩn danh'}</p>
                      <p className="text-xs text-[#7A7A90] mt-1">{timeAgo(c.created_at)}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <p className="text-sm text-[#EEEEF4] leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button onClick={() => handleBanUser(c.user_id)}
                          title="Cấm người dùng này"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A90] hover:text-orange-400 hover:bg-orange-500/10 transition-colors">
                          <ShieldOff size={15} />
                        </button>
                        <button onClick={() => handleDeleteComment(c.id)}
                          title="Xoá bình luận"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A90] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
