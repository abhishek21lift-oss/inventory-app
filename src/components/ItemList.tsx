import type { Item } from '../types'
import StockBadge from './StockBadge'

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

const catColors: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories', 'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

const conditionColors: Record<string, string> = {
  'New': 'text-[#00d4aa]', 'Good': 'text-[#64d2ff]', 'Fair': 'text-[#ff9f0a]', 'Needs Service': 'text-[#ff375f]',
}

export default function ItemList({ items, onEdit, onDelete }: ItemListProps) {
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
              <th>Equipment</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Location</th>
              <th>Condition</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="group transition-colors">
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
                <td className="text-right text-white font-medium">{item.quantity}</td>
                <td className="text-right text-white/70">${item.price.toFixed(2)}</td>
                <td className="text-center">
                  <StockBadge quantity={item.quantity} minStock={item.minStock} />
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">Edit</button>
                    <button onClick={() => onDelete(item.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
