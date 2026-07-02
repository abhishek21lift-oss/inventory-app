import type { Item, SortField, SortDir } from '../types'
import StockBadge from './StockBadge'
import { ChevronUp, ChevronDown, ChevronsUpDown, Copy, Pencil, Trash2, Minus, Plus } from 'lucide-react'

interface ItemListProps {
  items: Item[]
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAdjustStock: (id: string, change: number) => void
  onSelectItem: (item: Item) => void
}

const CAT_CLASS: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories',
  'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

function SortBtn({ active, dir }: { field: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={11} style={{ opacity: 0.3 }} />
  return dir === 'asc' ? <ChevronUp size={11} style={{ color: 'var(--color-brand-gold-light)' }} /> : <ChevronDown size={11} style={{ color: 'var(--color-brand-gold-light)' }} />
}

const SORTABLE_COLS: { field: SortField; label: string; align?: 'left' | 'right' | 'center' }[] = [
  { field: 'name', label: 'Item' },
  { field: 'sku', label: 'SKU' },
  { field: 'category', label: 'Category' },
  { field: 'brand', label: 'Brand' },
  { field: 'location', label: 'Location' },
  { field: 'condition', label: 'Condition' },
  { field: 'quantity', label: 'Qty', align: 'right' },
  { field: 'price', label: 'Price', align: 'right' },
]

export default function ItemList({ items, sortField, sortDir, onSort, onEdit, onDelete, onDuplicate, onAdjustStock, onSelectItem }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-icon">
          <span style={{ fontSize: 20 }}>📦</span>
        </div>
        <p>No items found</p>
        <span>Try adjusting filters or add a new item</span>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {SORTABLE_COLS.map(col => (
              <th
                key={col.field + col.label}
                className="sortable"
                style={{ textAlign: col.align || 'left' }}
                onClick={() => onSort(col.field)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  <SortBtn field={col.field} active={sortField === col.field} dir={sortDir} />
                </span>
              </th>
            ))}
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isOut = item.quantity === 0
            const isLow = item.quantity > 0 && item.quantity <= item.minStock
            return (
              <tr
                key={item.id}
                className={isOut ? 'row-danger' : isLow ? 'row-warning' : ''}
                onClick={() => onSelectItem(item)}
              >
                <td>
                  <div className="cell-primary" style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                </td>
                <td>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{item.sku}</span>
                </td>
                <td>
                  <span className={`cat-pill ${CAT_CLASS[item.category] || 'cat-accessories'}`}>
                    {item.category}
                  </span>
                </td>
                <td>{item.brand || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                <td>{item.location || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: item.condition === 'New' ? '#10b981'
                      : item.condition === 'Good' ? '#60a5fa'
                      : item.condition === 'Fair' ? '#fbbf24'
                      : '#f87171'
                  }}>
                    {item.condition}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onAdjustStock(item.id, -1)}
                      title="Decrease"
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: isOut ? '#f87171' : isLow ? '#fbbf24' : 'var(--color-text-primary)',
                      minWidth: 24, textAlign: 'center', display: 'inline-block'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onAdjustStock(item.id, 1)}
                      title="Increase"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-gold-light)' }}>
                    ${item.price.toFixed(2)}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <StockBadge quantity={item.quantity} minStock={item.minStock} />
                </td>
                <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <div className="action-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onDuplicate(item.id)}
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <style>{`
        .table tbody tr:hover .action-group { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
