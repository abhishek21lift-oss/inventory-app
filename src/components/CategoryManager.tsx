import type { Category } from '../types'
import { useState } from 'react'

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string) => void
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClose: () => void
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

export default function CategoryManager({ categories, onAdd, onUpdate, onDelete, onClose }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  const startEdit = (c: Category) => {
    setEditingId(c.id)
    setEditName(c.name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Manage Categories
              </span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="input-apple flex-1"
              placeholder="New category name..."
            />
            <button onClick={handleAdd} className="btn-premium text-sm px-4">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <div key={c.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${catColors[c.name] || colorValues[i % colorValues.length]}`}>
                {editingId === c.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                    onBlur={saveEdit}
                    className="w-24 text-xs px-1 py-0 border-b border-gray-300 outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <span onClick={() => startEdit(c)} className="cursor-pointer hover:opacity-70">{c.name}</span>
                )}
                <span className="text-[10px] opacity-50">({c.items_count || 0})</span>
                <button onClick={() => onDelete(c.id)} className="hover:opacity-70 text-sm leading-none ml-0.5">&times;</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
