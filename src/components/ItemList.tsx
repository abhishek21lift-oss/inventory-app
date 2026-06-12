import type { Item, SortField, SortDir } from '../types'
import StockBadge from './StockBadge'

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

const catColors: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories', 'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

const conditionColors: Record<string, string> = {
  'New': 'text-[#00d4aa]', 'Good': 'text-[#64d2ff]', 'Fair': 'text-[#ff9f0a]', 'Needs Service': 'text-[#ff375f]',
}

const columns: { field: SortField; label: string; align?: string }[] = [
  { field: 'name', label: 'Equipment' },
  { field: 'sku', label: 'SKU' },
  { field: 'category', label: 'Category' },
  { field: 'brand', label: 'Brand' },
  { field: 'location', label: 'Location' },
  { field: 'condition', label: 'Condition' },
  { field: 'quantity', label: 'Qty', align: 'text-right' },
  { field: 'price', label: 'Price', align: 'text-right' },
  { field: 'name', label: 'Status', align: 'text-center' },
  { field: 'name', label: 'Actions', align: 'text-right' },
]

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`inline-flex ml-1 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
      {dir === 'asc' ? '▲' : '▼'}
    </span>
  )
}

export default function ItemList({ items, sortField, sortDir, onSort, onEdit, onDelete, onDuplicate, onAdjustStock, onSelectItem }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="glass-card text-center py-16 px-6">
        <div className="text-5xl mb-4">💪</div>
        <p className="text-white/50 text-lg font-medium">No equipment found</p>
        <p className="text-white/30 text-sm mt-1">Try adjusting your search or add new gear.</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-gym">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.field + col.label}
                  onClick={() => col.label !== 'Status' && col.label !== 'Actions' ? onSort(col.field) : undefined}
                  className={`${col.align || 'text-left'} group cursor-pointer select-none ${col.label === 'Status' || col.label === 'Actions' ? 'cursor-default' : ''}`}
                >
                  {col.label}
                  {col.label !== 'Status' && col.label !== 'Actions' && (
                    <SortIcon active={sortField === col.field} dir={sortDir} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isLow = item.quantity > 0 && item.quantity <= item.minStock
              const isOut = item.quantity === 0
              return (
                <tr
                  key={item.id}
                  className={`group transition-colors cursor-pointer ${isOut ? 'row-out' : isLow ? 'row-low' : ''}`}
                  onClick={() => onSelectItem(item)}
                >
                  <td className="font-medium text-white">{item.name}</td>
                  <td className="font-mono text-xs text-white/30">{item.sku}</td>
                  <td>
                    <span className={`cat-pill ${catColors[item.category] || 'cat-accessories'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="text-white/60">{item.brand || '—'}</td>
                  <td className="text-white/60">{item.location || '—'}</td>
                  <td>
                    <span className={`font-medium text-xs ${conditionColors[item.condition] || 'text-white/40'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onAdjustStock(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition flex items-center justify-center text-sm font-bold"
                        title="Decrease quantity"
                      >−</button>
                      <span className="text-white font-medium min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onAdjustStock(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-[#00d4aa]/20 text-white/40 hover:text-[#00d4aa] transition flex items-center justify-center text-sm font-bold"
                        title="Increase quantity"
                      >+</button>
                    </div>
                  </td>
                  <td className="text-right text-white/70">${item.price.toFixed(2)}</td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <StockBadge quantity={item.quantity} minStock={item.minStock} />
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onDuplicate(item.id)} className="px-2 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition" title="Duplicate">📋</button>
                      <button onClick={() => onEdit(item)} className="px-2 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">Edit</button>
                      <button onClick={() => onDelete(item.id)} className="px-2 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
