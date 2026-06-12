import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../api'
import type { DashboardData } from '../types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#ff375f', '#5e5ce6', '#00d4aa', '#ffd60a', '#ff9f0a', '#64d2ff', '#bf5af2']

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading dashboard...</div>
  if (!data) return <div className="text-red-400 text-center py-20">Failed to load dashboard</div>

  // Sample chart data for revenue (since we don't have time-series yet, generate mock from invoices)
  const revenueData = [
    { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 4900 }, { month: 'Apr', revenue: 7200 },
    { month: 'May', revenue: 6100 }, { month: 'Jun', revenue: data.paidInvoices * 850 || 3500 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5">Real-time inventory overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Total Items</p>
          <p className="text-2xl font-bold text-white mt-1.5">{data.totalItems}</p>
          <p className="text-xs text-white/30">Across all warehouses</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Total Value</p>
          <p className="text-2xl font-bold text-[#00d4aa] mt-1.5">${data.totalValue.toLocaleString()}</p>
          <p className="text-xs text-white/30">Inventory worth</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-[#ffd60a] mt-1.5">{data.lowStock}</p>
          <p className="text-xs text-white/30">Below threshold</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-[#ff375f] mt-1.5">{data.outStock}</p>
          <p className="text-xs text-white/30">Needs reorder</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Warehouses</p>
          <p className="text-2xl font-bold text-[#5e5ce6] mt-1.5">{data.activeWarehouses}</p>
          <p className="text-xs text-white/30">Active locations</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Suppliers</p>
          <p className="text-2xl font-bold text-[#64d2ff] mt-1.5">{data.activeSuppliers}</p>
          <p className="text-xs text-white/30">Active vendors</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Pending POs</p>
          <p className="text-2xl font-bold text-[#ff9f0a] mt-1.5">{data.pendingPOs}</p>
          <p className="text-xs text-white/30">Awaiting receipt</p>
        </div>
        <div className="gradient-card p-4">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Paid Invoices</p>
          <p className="text-2xl font-bold text-[#00d4aa] mt-1.5">{data.paidInvoices}</p>
          <p className="text-xs text-white/30">Completed sales</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gradient-card p-5">
          <h3 className="text-sm font-bold text-white/70 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#00d4aa" strokeWidth={2} dot={{ fill: '#00d4aa', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="gradient-card p-5">
          <h3 className="text-sm font-bold text-white/70 mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.stockByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name as string}>
                {data.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock alerts */}
      {data.lowStockItems.length > 0 && (
        <div className="gradient-card p-5">
          <h3 className="text-sm font-bold text-[#ffd60a] mb-3 flex items-center gap-2">
            ⚠️ Low Stock Alerts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.lowStockItems.map(item => (
              <div key={item.sku} className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-[10px] text-white/30 font-mono">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#ffd60a]">{item.quantity}</p>
                  <p className="text-[10px] text-white/30">min {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="gradient-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/70">Recent Activity</h3>
          <Link to="/activity" className="text-xs text-[#5e5ce6] hover:underline">View all</Link>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="text-white/30 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map(a => (
              <div key={a.id} className="flex items-center gap-3 text-sm bg-white/5 rounded-lg px-4 py-2.5">
                <span className="text-base">{a.action.includes('Received') ? '📥' : a.action.includes('Paid') ? '💰' : '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 truncate">{a.details}</p>
                  <p className="text-[10px] text-white/30">{a.userName} · {new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
