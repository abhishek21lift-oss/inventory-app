import { useState } from 'react'
import type { Category } from '../types'

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

export default function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && !categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      onAdd(name.trim())
      setName('')
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Add</button>
      </form>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{c.name}</span>
            <button onClick={() => onDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs font-medium transition">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
