'use client'
import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getAuditLogs, type AuditLogRow } from './actions'
import { diffSnapshots } from '@/lib/admin/audit-diff'

const SELECT = 'h-9 px-3 rounded-lg bg-[#0F0F18] border border-[#1E1E2E] text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1]/60 focus:ring-1 focus:ring-[#6366f1]/20 transition-all'

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo',
  update: 'Sửa',
  delete: 'Xóa',
}

const ACTION_BADGE: Record<string, string> = {
  create: 'bg-green-500/10 text-green-400',
  update: 'bg-amber-500/10 text-amber-400',
  delete: 'bg-red-500/10 text-red-400',
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_BADGE[action] ?? 'bg-[#1E1E2E] text-[#7A7A90]'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${cls}`}>
      {ACTION_LABELS[action] ?? action}
    </span>
  )
}

function DiffView({ row }: { row: AuditLogRow }) {
  const diff = diffSnapshots(row.before, row.after)
  const keys = Object.keys(diff)

  if (keys.length === 0) {
    return <p className="text-sm text-[#484858] px-4 py-3">Không có dữ liệu thay đổi.</p>
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {keys.map(key => (
        <div key={key} className="space-y-1">
          <p className="text-xs font-medium text-[#7A7A90]">{key}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 overflow-x-auto">
              <pre className="text-xs text-red-400 whitespace-pre-wrap break-words">
                {JSON.stringify(diff[key].before, null, 1)}
              </pre>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre-wrap break-words">
                {JSON.stringify(diff[key].after, null, 1)}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AuditLogTab() {
  const [rows, setRows] = useState<AuditLogRow[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [entityTypes, setEntityTypes] = useState<string[]>([])
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async (targetPage: number, append: boolean) => {
    setLoading(true)
    setError('')
    try {
      const result = await getAuditLogs({
        entityType: entityType || undefined,
        action: action || undefined,
        page: targetPage,
      })
      setRows(prev => (append ? [...prev, ...result.rows] : result.rows))
      setHasMore(result.hasMore)
      setEntityTypes(result.entityTypes)
    } catch {
      setError('Không thể tải nhật ký hoạt động.')
      if (!append) setRows([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [entityType, action])

  useEffect(() => {
    setPage(0)
    load(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, action])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage, true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={entityType}
          onChange={e => setEntityType(e.target.value)}
          className={SELECT}
        >
          <option value="">Tất cả loại đối tượng</option>
          {entityTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={action}
          onChange={e => setAction(e.target.value)}
          className={SELECT}
        >
          <option value="">Tất cả hành động</option>
          <option value="create">Tạo</option>
          <option value="update">Sửa</option>
          <option value="delete">Xóa</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-xl overflow-hidden">
        {!loading && rows.length === 0 && !error && (
          <p className="text-sm text-[#484858] text-center py-10">
            Chưa có hoạt động nào được ghi nhận.
          </p>
        )}

        {rows.map((row, i) => {
          const isOpen = expanded === row.id
          return (
            <div key={row.id} className={i > 0 ? 'border-t border-[#1E1E2E]' : ''}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : row.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1A1A22] transition-colors"
              >
                <ActionBadge action={row.action} />
                <span className="text-sm text-[#7A7A90] shrink-0">{row.entity_type}</span>
                <span className="text-sm text-[#EEEEF4] truncate flex-1">{row.entity_label}</span>
                <span className="text-xs text-[#484858] shrink-0 hidden sm:block">{row.admin_email}</span>
                <span className="text-xs text-[#484858] shrink-0">
                  {new Date(row.created_at).toLocaleString('vi-VN')}
                </span>
                {isOpen ? (
                  <ChevronUp size={15} className="text-[#484858] shrink-0" />
                ) : (
                  <ChevronDown size={15} className="text-[#484858] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-[#1E1E2E] bg-[#0A0A12]">
                  <DiffView row={row} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="h-9 px-5 rounded-lg border border-[#1E1E2E] text-[#EEEEF4] text-sm font-medium hover:bg-[#1A1A22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tải…' : 'Tải thêm'}
          </button>
        </div>
      )}
    </div>
  )
}
