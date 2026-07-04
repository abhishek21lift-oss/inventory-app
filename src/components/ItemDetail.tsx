import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Item, StockHistoryEntry } from '../types'
import * as api from '../api'
import { X, Pencil, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react'
import { fmtCurrency, fmtDate, stockStatus } from '../lib/utils'
import StockBadge from './StockBadge'

interface ItemDetailProps {
  item: Item
  onClose: () => void
  onEdit: (item: Item) => void
  onAdjustStock: (id: string, change: number, note?: string) => void
}

const CONDITION_COLORS: Record<string, string> = {
  'New': '#10b981', 'Good': '#60a5fa', 'Fair': '#fbbf24', 'Needs Service': '#f87171',
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

export default function ItemDetail({ item, onClose, onEdit, onAdjustStock }: ItemDetailProps) {
  const [history, setHistory] = useState<StockHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const status = stockStatus(item.quantity, item.minStock)

  useEffect(() => {
    api.fetchItemHistory(item.id).then(setHistory).finally(() => setLoading(false))
  }, [item.id])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        className="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.3 }}>{item.name}</h2>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace', display: 'block', marginTop: 3 }}>{item.sku}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { onEdit(item); onClose() }} title="Edit">
                <Pencil size={14} />
              </button>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="panel-body">
          {/* Stock highlight */}
          <div style={{
            background: status === 'out' ? 'rgba(220,38,38,0.08)' : status === 'low' ? 'rgba(217,119,6,0.08)' : 'rgba(5,150,105,0.08)',
            border: `1px solid ${status === 'out' ? 'rgba(220,38,38,0.2)' : status === 'low' ? 'rgba(217,119,6,0.2)' : 'rgba(5,150,105,0.2)'}`,
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Stock</div>
              <div style={{
                fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em',
                color: status === 'out' ? '#f87171' : status === 'low' ? '#fbbf24' : '#10b981',
                lineHeight: 1.1, marginTop: 2
              }}>
                {item.quantity}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>Min: {item.minStock}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StockBadge quantity={item.quantity} minStock={item.minStock} />
              <div style={{ fontSize: 12, color: 'var(--color-brand-gold-light)', fontWeight: 700, marginTop: 8 }}>
                {fmtCurrency(item.price)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>unit price</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 6 }}>
                {fmtCurrency(item.price * item.quantity)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>total value</div>
            </div>
          </div>

          {/* Quick adjust */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => { onAdjustStock(item.id, -1, 'Manual decrease'); onClose() }}
            >
              − Remove 1
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => { onAdjustStock(item.id, 1, 'Manual restock'); onClose() }}
            >
              + Restock 1
            </button>
          </div>

          {/* Details grid */}
          <div style={{
            background: 'var(--color-surface-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 20px',
            marginBottom: 16
          }}>
            <FieldRow label="Category" value={item.category} />
            <FieldRow label="Brand" value={item.brand || '—'} />
            <FieldRow label="Location" value={item.location || '—'} />
            <FieldRow label="Condition" value={
              <span style={{ color: CONDITION_COLORS[item.condition] || 'var(--color-text-secondary)', fontWeight: 600 }}>
                {item.condition}
              </span>
            } />
            <FieldRow label="Created" value={fmtDate(item.createdAt)} />
            {item.updatedAt && <FieldRow label="Updated" value={fmtDate(item.updatedAt)} />}
          </div>

          {/* Stock history */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
              <ArrowUpDown size={13} />
              Stock History
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No stock changes recorded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map(h => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '9px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: h.change > 0 ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {h.change > 0
                          ? <TrendingUp size={12} style={{ color: '#10b981' }} />
                          : <TrendingDown size={12} style={{ color: '#f87171' }} />
                        }
                      </div>
                      <div>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: h.change > 0 ? '#10b981' : '#f87171'
                        }}>
                          {h.change > 0 ? '+' : ''}{h.change}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                          {h.previousQty} → {h.newQty}
                        </span>
                        {h.note && (
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>{h.note}</div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                      {fmtDate(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
