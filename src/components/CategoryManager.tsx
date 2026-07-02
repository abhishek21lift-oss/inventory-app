import type { Category } from '../types'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Tag, Pencil, Trash2 } from 'lucide-react'

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string) => void
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const CAT_COLORS = [
  { bg: 'rgba(220,38,38,0.1)', color: '#f87171', border: 'rgba(220,38,38,0.2)' },
  { bg: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: 'rgba(124,58,237,0.2)' },
  { bg: 'rgba(5,150,105,0.1)', color: '#34d399', border: 'rgba(5,150,105,0.2)' },
  { bg: 'rgba(217,119,6,0.1)', color: '#fbbf24', border: 'rgba(217,119,6,0.2)' },
  { bg: 'rgba(37,99,235,0.1)', color: '#60a5fa', border: 'rgba(37,99,235,0.2)' },
  { bg: 'rgba(201,151,58,0.1)', color: '#e8b84b', border: 'rgba(201,151,58,0.2)' },
  { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
]

export default function CategoryManager({ categories, onAdd, onUpdate, onDelete, onClose }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) onUpdate(editingId, editName.trim())
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(201,151,58,0.12)',
              border: '1px solid rgba(201,151,58,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Tag size={15} style={{ color: 'var(--color-brand-gold-light)' }} />
            </div>
            <h2 className="modal-title">Manage Categories</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="input"
              placeholder="New category name..."
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={14} />
              Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {categories.map((c, i) => {
              const col = CAT_COLORS[i % CAT_COLORS.length]
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                  borderRadius: 10
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: col.color, flexShrink: 0
                  }} />

                  {editingId === c.id ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      onBlur={saveEdit}
                      className="input"
                      style={{ flex: 1, padding: '4px 8px', fontSize: 13 }}
                      autoFocus
                    />
                  ) : (
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: col.color }}>
                      {c.name}
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 8 }}>({c.items_count || 0})</span>
                    </span>
                  )}

                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => { setEditingId(c.id); setEditName(c.name) }}
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    onClick={() => onDelete(c.id)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
            {categories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No categories yet. Add one above.
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </div>
  )
}
