'use client'
import { useState } from 'react'
import PasswordTab from './PasswordTab'
import { AuditLogTab } from './AuditLogTab'

const TABS = [
  { key: 'security', label: 'Bảo mật' },
  { key: 'audit', label: 'Nhật ký hoạt động' },
] as const

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('security')
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#EEEEF4]">Cài đặt</h1>
        <p className="text-sm text-[#484858] mt-1">Quản lý tài khoản quản trị</p>
      </div>

      <div className="flex gap-1 border-b border-[#1E1E2E]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? 'border-indigo-500 text-[#EEEEF4]'
                : 'border-transparent text-[#484858] hover:text-[#7A7A90]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'security' ? <PasswordTab /> : <AuditLogTab />}
    </div>
  )
}
