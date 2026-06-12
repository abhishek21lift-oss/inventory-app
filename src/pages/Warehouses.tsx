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
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = async () => { try { setWarehouses(await fetchWarehouses()) } catch { show('Failed') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editWh) { await updateWarehouse(editWh.id, { name, location }); show('Updated') }
      else { await createWarehouse(name, location); show('Created') }
      setShowForm(false); setEditWh(undefined); setName(''); setLocation(''); load()
    } catch { show('Failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this warehouse?')) return
    try { await deleteWarehouse(id); show('Deleted'); load() } catch { show('Failed') }
  }

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Warehouses</h1><p className="text-sm text-gray-500 mt-0.5">{warehouses.length} locations</p></div>
        <button onClick={() => { setEditWh(undefined); setName(''); setLocation(''); setShowForm(true) }} className="btn-premium flex items-center gap-1.5">+ Add Warehouse</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(wh => (
          <div key={wh.id} className="premium-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">🏭</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => { setEditWh(wh); setName(wh.name); setLocation(wh.location); setShowForm(true) }} className="btn-light text-xs px-2.5 py-1.5">Edit</button>
                <button onClick={() => handleDelete(wh.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">Delete</button>
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900">{wh.name}</h3>
            <p className="text-sm text-gray-500">{wh.location || 'No location set'}</p>
            <div className="mt-3">
              <span className={`badge ${wh.isActive ? 'badge-green' : 'badge-red'}`}>{wh.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editWh ? 'Edit Warehouse' : 'New Warehouse'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-apple w-full" placeholder="e.g. Main Warehouse" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="input-apple w-full" placeholder="e.g. Downtown" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-light">Cancel</button>
                <button type="submit" className="btn-premium">{editWh ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
