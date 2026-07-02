import { useEffect, useState } from 'react'
import { fetchActivities } from '../api'
import type { ActivityLog } from '../types'
import { Activity, Package, DollarSign, RefreshCw, ArrowDownToLine, Tag } from 'lucide-react'
import { fmtDateTime } from '../lib/utils'

const ACTION_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'PO Received': { icon: ArrowDownToLine, color: '#10b981', bg: 'rgba(5,150,105,0.1)' },
  'Invoice Paid': { icon: DollarSign, color: '#c9973a', bg: 'rgba(201,151,58,0.1)' },
  'Stock Transfer': { icon: RefreshCw, color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
  'Stock updated': { icon: Package, color: '#fbbf24', bg: 'rgba(217,119,6,0.1)' },
  'Category created': { icon: Tag, color: '#60a5fa', bg: 'rgba(37,99,235,0.1)' },
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchActivities(200).then(setLogs).finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="skeleton" style={{ height: 50 }} />
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">{logs.length} event{logs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Activity size={20} style={{ color: 'var(--color-text-muted)' }} /></div>
            <p>No activity recorded yet</p>
            <span>Events will appear here as you use the system</span>
          </div>
        ) : (
          <div>
            {logs.map((log, i) => {
              const act = ACTION_MAP[log.action] || { icon: Activity, color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.05)' }
              const Icon = act.icon
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: act.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1
                  }}>
                    <Icon size={14} style={{ color: act.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                      {log.details}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {log.userName || 'System'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {fmtDateTime(log.createdAt)}
                      </span>
                      {log.entityType && (
                        <>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>·</span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '1px 6px' }}>
                            {log.entityType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    flexShrink: 0,
                    fontSize: 10, fontWeight: 600,
                    color: act.color,
                    background: act.bg,
                    border: `1px solid ${act.color}30`,
                    borderRadius: 100,
                    padding: '2px 8px',
                    whiteSpace: 'nowrap'
                  }}>
                    {log.action}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
