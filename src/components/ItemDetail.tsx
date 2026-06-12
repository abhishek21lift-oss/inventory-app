import { useState, useEffect } from 'react'
import type { Item, StockHistoryEntry } from '../types'
import * as api from '../api'

interface ItemDetailProps {
  item: Item
  onClose: () => void
  onEdit: (item: Item) => void
  onAdjustStock: (id: string, change: number, note?: string) => void
}

const conditionColors: Record<string, string> = {
  'New': 'text-green-600', 'Good': 'text-blue-600', 'Fair': 'text-orange-600', 'Needs Service': 'text-red-600',
}

export default function ItemDetail({ item, onClose, onEdit, onAdjustStock }: ItemDetailProps) {
  const [history, setHistory] = useState<StockHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.fetchItemHistory(item.id).then(setHistory).finally(() => setLoading(false)) }, [item.id])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/10 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white border-l border-gray-100 h-full overflow-y-auto shadow-2xl shadow-gray-200 slide-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Category</p>
                <p className="text-gray-800 font-medium">{item.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Brand</p>
                <p className="text-gray-800 font-medium">{item.brand || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Location</p>
                <p className="text-gray-800 font-medium">{item.location || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Condition</p>
                <p className={`font-semibold text-sm ${conditionColors[item.condition] || 'text-gray-500'}`}>{item.condition}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Quantity</p>
                <p className={`text-2xl font-bold ${item.quantity <= item.minStock ? 'text-orange-600' : 'text-gray-900'}`}>{item.quantity}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Min Stock</p>
                <p className="text-gray-700 font-medium">{item.minStock}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Price</p>
                <p className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Total Value</p>
                <p className="text-lg font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
              Created {new Date(item.createdAt).toLocaleDateString()}
              {item.updatedAt && <> · Updated {new Date(item.updatedAt).toLocaleDateString()}</>}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { onEdit(item); onClose() }} className="btn-primary flex-1 py-2.5 text-sm">Edit Item</button>
            <button onClick={() => { onAdjustStock(item.id, 1, 'Manual restock'); onClose() }} className="btn-secondary px-4 py-2.5 text-sm">+ Restock</button>
          </div>

          <div>
            <h3 className="section-header mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Stock History
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-gray-400 text-sm">No stock changes recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${h.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {h.change > 0 ? '+' : ''}{h.change}
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">{h.previousQty} → {h.newQty}</p>
                        {h.note && <p className="text-[10px] text-gray-400 mt-0.5">{h.note}</p>}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
