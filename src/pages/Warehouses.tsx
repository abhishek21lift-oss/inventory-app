import { useEffect, useState } from 'react'
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../api'
import type { Warehouse } from '../types'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editWh, setEditWh] = useState<Warehouse | undefined>()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [toast, setToast] = useState('')

  const show = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    try { setWarehouses(await fetchWarehouses()) } catch { show('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editWh) {
        await updateWarehouse(editWh.id, { name, location })
        show('Warehouse updated')
      } else {
        await createWarehouse(name, location)
        show('Warehouse created')
      }
      setShowForm(false); setEditWh(undefined); setName(''); setLocation('')
      load()
    } catch { show('Failed to save') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this warehouse?')) return
    try { await deleteWarehouse(id); show('Warehouse deleted'); load() } catch { show('Failed to delete') }
  }

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Warehouses</h1><p className="text-sm text-white/40 mt-0.5">{warehouses.length} locations</p></div>
        <button onClick={() => { setEditWh(undefined); setName(''); setLocation(''); setShowForm(true) }} className="btn-primary px-4 py-2.5 text-sm">+ Add Warehouse</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(wh => (
          <div key={wh.id} className="gradient-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#5e5ce6]/10 text-[#5e5ce6] flex items-center justify-center text-lg">🏭</div>
              <div className="flex gap-1">
                <button onClick={() => { setEditWh(wh); setName(wh.name); setLocation(wh.location); setShowForm(true) }} className="text-xs text-white/40 hover:text-white px-2 py-1 rounded bg-white/5">Edit</button>
                <button onClick={() => handleDelete(wh.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-white/5">Del</button>
              </div>
            </div>
            <h3 className="text-base font-bold text-white">{wh.name}</h3>
            <p className="text-sm text-white/40">{wh.location || 'No location set'}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${wh.isActive ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-red-500/10 text-red-400'}`}>
                {wh.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowForm(false)}>
          <div className="gradient-card w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editWh ? 'Edit Warehouse' : 'New Warehouse'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. Main Warehouse" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. Downtown" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">{editWh ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
