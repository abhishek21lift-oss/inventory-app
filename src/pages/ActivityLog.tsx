import { useEffect, useState } from 'react'
import { fetchActivities } from '../api'
import type { ActivityLog } from '../types'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities(200).then(setLogs).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading...</div>

  const actionIcons: Record<string, string> = {
    'PO Received': '📥', 'Invoice Paid': '💰', 'Stock Transfer': '🔄', 'Stock updated': '📦',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-white/40 mt-0.5">{logs.length} events recorded</p>
      </div>

      <div className="glass-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📜</div>
            <p className="text-white/40 text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition">
                <span className="text-lg mt-0.5">{actionIcons[log.action] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/30">{log.userName || 'System'}</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30 capitalize">{log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</span>
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
