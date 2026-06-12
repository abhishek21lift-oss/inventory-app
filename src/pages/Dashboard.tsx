import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../api'
import type { DashboardData } from '../types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#0071e3', '#5856D6', '#34C759', '#FF9500', '#FF2D55', '#5AC8FA', '#FFCC00']

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard().then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading dashboard...</div>
  if (!data) return <div className="text-center py-20 text-red-500 font-medium">Failed to load dashboard</div>

  const revenueData = [
    { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 4900 }, { month: 'Apr', revenue: 7200 },
    { month: 'May', revenue: 6100 }, { month: 'Jun', revenue: data.paidInvoices * 850 || 3500 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time inventory overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: data.totalItems, color: 'bg-blue-50 text-blue-600', icon: '📦' },
          { label: 'Total Value', value: `$${data.totalValue.toLocaleString()}`, color: 'bg-green-50 text-green-600', icon: '💰' },
          { label: 'Low Stock', value: data.lowStock, color: 'bg-orange-50 text-orange-600', icon: '⚠️' },
          { label: 'Out of Stock', value: data.outStock, color: 'bg-red-50 text-red-600', icon: '🚫' },
          { label: 'Warehouses', value: data.activeWarehouses, color: 'bg-purple-50 text-purple-600', icon: '🏭' },
          { label: 'Suppliers', value: data.activeSuppliers, color: 'bg-cyan-50 text-cyan-600', icon: '🚚' },
          { label: 'Pending POs', value: data.pendingPOs, color: 'bg-orange-50 text-orange-600', icon: '📋' },
          { label: 'Paid Invoices', value: data.paidInvoices, color: 'bg-green-50 text-green-600', icon: '🧾' },
        ].map(s => (
          <div key={s.label} className="gradient-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">{s.value}</p>
              </div>
              <div className={`stat-ring ${s.color}`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="section-header mb-5">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.15)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis stroke="rgba(0,0,0,0.15)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={2.5} dot={{ fill: '#0071e3', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="section-header mb-5">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.stockByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={85} label={({ name }) => name as string}>
                {data.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#86868b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.lowStockItems.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="section-header mb-4">⚠ Low Stock Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.lowStockItems.map(item => (
              <div key={item.sku} className="list-item flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{item.quantity}</p>
                  <p className="text-[10px] text-gray-400">min {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header">Recent Activity</h3>
          <Link to="/activity" className="text-xs text-blue-600 hover:underline font-semibold">View all</Link>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map(a => (
              <div key={a.id} className="list-item flex items-center gap-4">
                <span className="text-lg">{a.action.includes('Received') ? '📥' : a.action.includes('Paid') ? '💰' : '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{a.details}</p>
                  <p className="text-[11px] text-gray-400">{a.userName} · {new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
