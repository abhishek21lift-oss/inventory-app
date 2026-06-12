import type { Category } from '../types'
import { useState } from 'react'

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}

const catColors: Record<string, string> = {
  'Cardio': 'bg-red-50 text-red-600 border-red-100',
  'Strength': 'bg-purple-50 text-purple-600 border-purple-100',
  'Free Weights': 'bg-green-50 text-green-600 border-green-100',
  'Machines': 'bg-orange-50 text-orange-600 border-orange-100',
  'Accessories': 'bg-blue-50 text-blue-600 border-blue-100',
  'Supplements': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Apparel': 'bg-pink-50 text-pink-600 border-pink-100',
}

const colorValues = Object.values(catColors)

export default function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="input-gym flex-1"
          placeholder="New category name..."
        />
        <button onClick={handleAdd} className="btn-primary text-sm px-4">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c, i) => (
          <div key={c.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${catColors[c.name] || colorValues[i % colorValues.length]}`}>
            {c.name}
            <span className="text-[10px] opacity-50">({c.items_count || 0})</span>
            <button onClick={() => onDelete(c.id)} className="hover:opacity-70 text-sm leading-none ml-0.5">&times;</button>
          </div>
        ))}
      </div>
    </div>
  )
}
