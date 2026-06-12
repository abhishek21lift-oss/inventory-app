import { useState } from 'react'
import type { Category } from '../types'

const catColors: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories', 'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

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
          className="input-neon flex-1 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div key={c.id} className={`cat-pill ${catColors[c.name] || 'cat-accessories'} gap-2`}>
            <span>{c.name}</span>
            <button onClick={() => onDelete(c.id)} className="opacity-60 hover:opacity-100 transition text-xs ml-1">&times;</button>
          </div>
        ))}
      </div>
    </div>
  )
}
