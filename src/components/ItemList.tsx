import type { Item } from '../types'
import StockBadge from './StockBadge'

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

export default function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No items found</p>
        <p className="text-sm mt-1">Try adjusting your search or add a new item.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">SKU</th>
            <th className="text-left px-4 py-3 font-medium">Category</th>
            <th className="text-right px-4 py-3 font-medium">Qty</th>
            <th className="text-right px-4 py-3 font-medium">Price</th>
            <th className="text-center px-4 py-3 font-medium">Status</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.sku}</td>
              <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{item.category}</span></td>
              <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-700">${item.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-center"><StockBadge quantity={item.quantity} minStock={item.minStock} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-medium transition">Edit</button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 text-xs font-medium transition">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
