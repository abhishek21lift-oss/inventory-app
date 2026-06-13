import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchActivities } from '../api'
import type { ActivityLog } from '../types'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchActivities(200).then(setLogs).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  const actionIcons: Record<string, { icon: string; bg: string }> = {
    'PO Received': { icon: '📥', bg: 'from-emerald-100 to-green-100' },
    'Invoice Paid': { icon: '💰', bg: 'from-blue-100 to-cyan-100' },
    'Stock Transfer': { icon: '🔄', bg: 'from-purple-100 to-violet-100' },
    'Stock updated': { icon: '📦', bg: 'from-amber-100 to-orange-100' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">Activity Log</span>
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{logs.length} events</p>
      </div>

      <div className="premium-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-50">📜</div>
            <p className="text-gray-400 text-sm font-medium">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log, i) => {
              const action = actionIcons[log.action] || { icon: '📌', bg: 'from-gray-100 to-gray-50' }
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-transparent transition-colors"
                >
                  <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${action.bg} flex items-center justify-center text-sm shrink-0 shadow-sm`}>
                    {action.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-semibold">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 font-medium">{log.userName || 'System'}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400 font-mono">{log.entityType} #{log.entityId?.slice(0, 8) || ''}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
