import { useEffect, useState } from 'react'
import { fetchActivities } from '../api'
import type { ActivityLog } from '../types'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchActivities(200).then(setLogs).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  const actionIcons: Record<string, string> = { 'PO Received': '📥', 'Invoice Paid': '💰', 'Stock Transfer': '🔄', 'Stock updated': '📦' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">{logs.length} events</p>
      </div>

      <div className="glass-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-50">📜</div>
            <p className="text-gray-400 text-sm font-medium">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map(log => (
              <div key={log.id} className="list-item !border-0 !rounded-none flex items-start gap-4">
                <span className="text-lg mt-0.5">{actionIcons[log.action] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400 font-medium">{log.userName || 'System'}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
