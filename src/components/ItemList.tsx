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
  'New': 'text-green-600', 'Good': 'text-blue-600', 'Fair': 'text-orange-600', 'Needs Service': 'text-red-600',
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
    <span className={`inline-flex ml-1 transition-opacity text-[10px] ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
      {dir === 'asc' ? '▲' : '▼'}
    </span>
  )
}

export default function ItemList({ items, sortField, sortDir, onSort, onEdit, onDelete, onDuplicate, onAdjustStock, onSelectItem }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="glass-card text-center py-16 px-6">
        <div className="text-5xl mb-4 opacity-30">📦</div>
        <p className="text-gray-500 text-lg font-medium">No items found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your search.</p>
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
                  className={`group cursor-pointer transition-colors ${isOut ? 'row-out' : isLow ? 'row-low' : ''}`}
                  onClick={() => onSelectItem(item)}
                >
                  <td className="font-semibold text-gray-800">{item.name}</td>
                  <td className="font-mono text-xs text-gray-400">{item.sku}</td>
                  <td>
                    <span className={`cat-pill ${catColors[item.category] || 'cat-accessories'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="text-gray-500">{item.brand || '—'}</td>
                  <td className="text-gray-500">{item.location || '—'}</td>
                  <td>
                    <span className={`font-semibold text-xs ${conditionColors[item.condition] || 'text-gray-400'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onAdjustStock(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition flex items-center justify-center text-sm font-bold"
                        title="Decrease"
                      >−</button>
                      <span className="text-gray-800 font-semibold min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onAdjustStock(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 transition flex items-center justify-center text-sm font-bold"
                        title="Increase"
                      >+</button>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="font-semibold text-gray-800">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <StockBadge quantity={item.quantity} minStock={item.minStock} />
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => onDuplicate(item.id)} className="btn-icon text-xs" title="Duplicate">📋</button>
                      <button onClick={() => onEdit(item)} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200">Edit</button>
                      <button onClick={() => onDelete(item.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">Delete</button>
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
