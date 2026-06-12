import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../api'
import type { DashboardData } from '../types'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#0071e3', '#5856D6', '#34C759', '#FF9500', '#FF2D55', '#5AC8FA', '#FFCC00']

const cards = [
  { label: 'Total Items', key: 'totalItems' as const, suffix: '', icon: '📦', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600' },
  { label: 'Total Value', key: 'totalValue' as const, prefix: '$', icon: '💰', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600', format: true },
  { label: 'Low Stock', key: 'lowStock' as const, suffix: '', icon: '⚠️', gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50 text-amber-600' },
  { label: 'Out of Stock', key: 'outStock' as const, suffix: '', icon: '🚫', gradient: 'from-rose-500 to-red-500', light: 'bg-rose-50 text-rose-600' },
  { label: 'Warehouses', key: 'activeWarehouses' as const, suffix: '', icon: '🏭', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-600' },
  { label: 'Suppliers', key: 'activeSuppliers' as const, suffix: '', icon: '🚚', gradient: 'from-cyan-500 to-teal-500', light: 'bg-cyan-50 text-cyan-600' },
  { label: 'Pending POs', key: 'pendingPOs' as const, suffix: '', icon: '📋', gradient: 'from-orange-500 to-amber-600', light: 'bg-orange-50 text-orange-600' },
  { label: 'Paid Invoices', key: 'paidInvoices' as const, suffix: '', icon: '🧾', gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 text-green-600' },
]

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-xl" />
      <div className="h-4 w-72 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-100 rounded-2xl" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard().then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return <LoadingSkeleton />
  if (!data) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-30">📊</div>
        <p className="text-gray-500 text-lg font-medium">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry</button>
      </div>
    </div>
  )

  const hr = new Date().getHours()
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'

  const revenueData = [
    { month: 'Jan', revenue: 4200, lastYear: 3800 },
    { month: 'Feb', revenue: 5800, lastYear: 4100 },
    { month: 'Mar', revenue: 4900, lastYear: 5200 },
    { month: 'Apr', revenue: 7200, lastYear: 4800 },
    { month: 'May', revenue: 6100, lastYear: 5600 },
    { month: 'Jun', revenue: data.paidInvoices * 850 + 3500 || 6500, lastYear: 5100 },
  ]

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}, admin 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1.5 max-w-xl">
              Here&apos;s what&apos;s happening across your inventory today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
            <span className="text-2xl">📊</span>
            <div className="text-right">
              <p className="text-xs text-blue-200">Portfolio Value</p>
              <p className="text-lg font-bold">${data.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            System Online
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
            {data.totalItems} total items
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
            {data.activeWarehouses} warehouses
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => {
          const val = data[c.key]
          const display = typeof val === 'number'
            ? c.key === 'totalValue'
              ? `$${val.toLocaleString()}`
              : val.toLocaleString()
            : val
          return (
            <div
              key={c.key}
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} shadow-lg flex items-center justify-center text-lg text-white`}>
                  {c.icon}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{display}</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${c.gradient} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800">Revenue</h3>
            <div className="pill-nav">
              <button className="active">6 Months</button>
              <button>Year</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.12)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.12)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '10px 14px' }}
                labelStyle={{ fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#0071e3', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-5">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.stockByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {data.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 11, color: '#86868b', paddingLeft: 10 }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800">Low Stock Alerts</h3>
            {data.lowStockItems.length > 0 && (
              <span className="badge badge-yellow ml-auto">{data.lowStockItems.length} items</span>
            )}
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="flex items-center gap-3 py-8 text-center justify-center">
              <span className="text-2xl">✅</span>
              <p className="text-gray-400 text-sm font-medium">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockItems.map(item => (
                <div key={item.sku} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{item.quantity}</p>
                    <p className="text-[10px] text-gray-400">min {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            <Link to="/activity" className="text-xs text-blue-600 hover:underline font-semibold">View all</Link>
          </div>
          {data.recentActivity.length === 0 ? (
            <div className="flex items-center gap-3 py-8 text-center justify-center">
              <span className="text-2xl">📭</span>
              <p className="text-gray-400 text-sm font-medium">No activity yet</p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-0">
              {data.recentActivity.slice(0, 6).map(a => (
                <div key={a.id} className="relative pb-4 pl-6 border-l-2 border-gray-100 last:border-transparent">
                  <span className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 border-white ${
                    a.action.includes('Received') ? 'bg-emerald-100 text-emerald-600' :
                    a.action.includes('Paid') ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {a.action.includes('Received') ? '📥' : a.action.includes('Paid') ? '💰' : '📌'}
                  </span>
                  <p className="text-sm text-gray-700 font-medium truncate">{a.details}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.userName} · {new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
