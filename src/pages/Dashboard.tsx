import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchDashboard } from '../api'
import type { DashboardData } from '../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

const COLORS = ['#0071e3', '#5856D6', '#34C759', '#FF9500', '#FF2D55', '#5AC8FA', '#FFCC00']

const cards = [
  { label: 'Total Items', key: 'totalItems' as const, icon: '📦', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600' },
  { label: 'Total Value', key: 'totalValue' as const, prefix: '$', icon: '💰', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600' },
  { label: 'Low Stock', key: 'lowStock' as const, icon: '⚠️', gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50 text-amber-600' },
  { label: 'Out of Stock', key: 'outStock' as const, icon: '🚫', gradient: 'from-rose-500 to-red-500', light: 'bg-rose-50 text-rose-600' },
  { label: 'Warehouses', key: 'activeWarehouses' as const, icon: '🏭', gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50 text-violet-600' },
  { label: 'Suppliers', key: 'activeSuppliers' as const, icon: '🚚', gradient: 'from-cyan-500 to-teal-500', light: 'bg-cyan-50 text-cyan-600' },
  { label: 'Pending POs', key: 'pendingPOs' as const, icon: '📋', gradient: 'from-orange-500 to-amber-600', light: 'bg-orange-50 text-orange-600' },
  { label: 'Paid Invoices', key: 'paidInvoices' as const, icon: '🧾', gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 text-green-600' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] as const } } }

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-56 bg-gray-200 rounded-2xl" />
      <div className="h-4 w-80 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
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
        <div className="text-6xl mb-4 opacity-30 animate-pulse">📊</div>
        <p className="text-gray-500 text-lg font-medium">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="btn-premium mt-4">Retry</button>
      </div>
    </div>
  )

  const utilization = data.activeWarehouses > 0 ? Math.round((data.activeWarehouses / (data.activeWarehouses + 1)) * 100) : 0
  const fulfillmentRate = data.paidInvoices > 0 ? Math.round((data.paidInvoices / (data.pendingPOs + data.paidInvoices)) * 100) : 0

  const revenueData = [
    { month: 'Jan', revenue: 4200, cost: 2900 },
    { month: 'Feb', revenue: 5800, cost: 3400 },
    { month: 'Mar', revenue: 4900, cost: 3100 },
    { month: 'Apr', revenue: 7200, cost: 4200 },
    { month: 'May', revenue: 6100, cost: 3800 },
    { month: 'Jun', revenue: data.paidInvoices * 850 + 3500 || 6500, cost: data.paidInvoices * 500 + 2800 || 4500 },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Hero */}
      <motion.div variants={itemAnim} className="relative bg-gradient-to-br from-[#0071e3] via-[#5856D6] to-[#FF2D55] rounded-3xl p-7 sm:p-9 text-white overflow-hidden shadow-2xl shadow-blue-500/25">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
              </h1>
              <p className="text-white/70 text-sm mt-1.5 max-w-xl font-medium">Your inventory at a glance — real-time metrics, trends, and insights.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white/15 rounded-2xl px-5 py-3 backdrop-blur-md border border-white/10">
              <span className="text-2xl">💰</span>
              <div className="text-right">
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Total Value</p>
                <p className="text-xl font-extrabold">${data.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /> System Online
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">📦 {data.totalItems} items</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">🏭 {data.activeWarehouses} warehouses</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">🚚 {data.activeSuppliers} suppliers</span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => {
          const val = data[c.key]
          const display = typeof val === 'number'
            ? c.key === 'totalValue' ? `$${val.toLocaleString()}` : val.toLocaleString()
            : val
          return (
            <motion.div
              key={c.key}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="stat-card group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-xl text-white shadow-lg`}>
                  {c.icon}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold">{c.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{display}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Revenue vs Cost</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">6-month trend</p>
            </div>
            <div className="pill-nav">
              <button className="active">6M</button>
              <button>1Y</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF2D55" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FF2D55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.12)" tick={{ fontSize: 12, fill: '#86868b', fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.12)" tick={{ fontSize: 12, fill: '#86868b', fontWeight: 500 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                labelStyle={{ fontWeight: 700, color: '#1d1d1f', marginBottom: 4, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={3} fill="url(#revGrad)" dot={{ fill: '#0071e3', r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: '#0071e3' }} />
              <Area type="monotone" dataKey="cost" stroke="#FF2D55" strokeWidth={2} fill="url(#costGrad)" dot={{ fill: '#FF2D55', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut section */}
        <div className="space-y-6">
          {/* Stock by category donut */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Stock by Category</h3>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={data.stockByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {data.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {data.stockByCategory.slice(0, 5).map((c, i) => (
                  <div key={c.category} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 font-medium truncate">{c.category}</span>
                    <span className="ml-auto text-gray-900 font-bold">{c.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini metric donuts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-5 text-center">
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie data={[{ name: 'Utilized', value: utilization }, { name: 'Free', value: 100 - utilization }]} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} startAngle={90} endAngle={-270}>
                    <Cell fill="#5856D6" />
                    <Cell fill="#f0f0f5" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Warehouse</p>
              <p className="text-lg font-extrabold text-gray-900 -mt-0.5">{utilization}%</p>
            </div>
            <div className="premium-card p-5 text-center">
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie data={[{ name: 'Fulfilled', value: fulfillmentRate }, { name: 'Pending', value: 100 - fulfillmentRate }]} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} startAngle={90} endAngle={-270}>
                    <Cell fill="#34C759" />
                    <Cell fill="#f0f0f5" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">Fulfillment</p>
              <p className="text-lg font-extrabold text-gray-900 -mt-0.5">{fulfillmentRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800">Low Stock Alerts</h3>
            {data.lowStockItems.length > 0 && (
              <span className="badge badge-yellow ml-auto">{data.lowStockItems.length} items</span>
            )}
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="flex items-center gap-3 py-8 text-center justify-center">
              <span className="text-3xl">✅</span>
              <p className="text-gray-400 text-sm font-medium">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockItems.map((item, i) => (
                <motion.div
                  key={item.sku}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between bg-amber-50 rounded-2xl px-5 py-3.5 border border-amber-100"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-amber-600">{item.quantity}</p>
                    <p className="text-[10px] text-gray-400 font-medium">min {item.minStock}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            <Link to="/activity" className="text-xs text-blue-600 hover:underline font-semibold">View all</Link>
          </div>
          {data.recentActivity.length === 0 ? (
            <div className="flex items-center gap-3 py-8 text-center justify-center">
              <span className="text-3xl">📭</span>
              <p className="text-gray-400 text-sm font-medium">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {data.recentActivity.slice(0, 6).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-none"
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    a.action.includes('Received') ? 'bg-emerald-100' :
                    a.action.includes('Paid') ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {a.action.includes('Received') ? '📥' : a.action.includes('Paid') ? '💰' : '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-semibold truncate">{a.details}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{a.userName} · {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
