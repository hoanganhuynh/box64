'use client'
import { useEffect, useState, useTransition } from 'react'
import { Trash2, ExternalLink, Search } from 'lucide-react'
import {
  getCustomRequests, updateRequestStatus, deleteCustomRequest,
  type CustomRequestRow,
} from './actions'

const STATUS_OPTIONS = [
  { value: 'new',       label: 'Mới',        color: 'text-[#F0A500] bg-[#F0A500]/10' },
  { value: 'contacted', label: 'Đã liên hệ', color: 'text-blue-400 bg-blue-500/10' },
  { value: 'closed',    label: 'Đã xong',    color: 'text-emerald-400 bg-emerald-500/10' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hôm nay'
  if (d === 1) return 'Hôm qua'
  if (d < 30) return `${d} ngày trước`
  return `${Math.floor(d / 30)} tháng trước`
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<CustomRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    getCustomRequests().then(r => { setRequests(r); setLoading(false) })
  }, [])

  function load() {
    getCustomRequests().then(setRequests)
  }

  function handleStatusChange(id: string, status: string) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    startTransition(async () => { await updateRequestStatus(id, status); load() })
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá yêu cầu này?')) return
    setRequests(prev => prev.filter(r => r.id !== id))
    await deleteCustomRequest(id)
  }

  if (loading) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl mb-6">
        Yêu cầu mẫu <span className="text-[#484858] font-normal">({requests.length})</span>
      </h1>

      {requests.length === 0 ? (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl py-16 text-center text-[#484858] text-sm">
          Chưa có yêu cầu nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(r => {
            const statusOpt = STATUS_OPTIONS.find(s => s.value === r.status) ?? STATUS_OPTIONS[0]
            return (
              <div key={r.id} className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#EEEEF4]">{r.name}</p>
                      <span className="text-sm text-[#484858]">·</span>
                      <p className="text-sm text-[#7A7A90] font-mono">{r.phone}</p>
                      {r.source === 'search' && (
                        <span className="inline-flex items-center gap-1 text-sm text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded-full">
                          <Search size={10} /> từ tìm kiếm
                        </span>
                      )}
                    </div>
                    {r.search_query && (
                      <p className="text-sm text-[#484858] mt-1">Đã tìm: &ldquo;{r.search_query}&rdquo;</p>
                    )}
                    <p className="text-sm text-[#383848] mt-1">{timeAgo(r.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={e => handleStatusChange(r.id, e.target.value)}
                      className={`text-sm font-semibold px-2.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${statusOpt.color}`}
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} className="bg-[#111118] text-[#EEEEF4]">{o.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#484858] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {r.car_models.map((c, i) => (
                    <span key={i} className="text-sm font-medium text-[#EEEEF4] bg-[#1A1A22] px-2.5 py-1 rounded-lg">
                      {c}
                    </span>
                  ))}
                </div>

                {r.image_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {r.image_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#6366f1] hover:text-[#7C7FF2] transition-colors">
                        <ExternalLink size={11} /> Ảnh {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
