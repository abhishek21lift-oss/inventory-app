import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { fetchDashboard } from '../api'
import type { DashboardData } from '../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

const COLORS = ['#0071e3', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#eab308']

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] as const } } }

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const duration = 800
    const step = Math.max(1, Math.floor(end / 30))
    const interval = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(interval) }
      else setCount(start)
    }, duration / (end / step))
    return () => clearInterval(interval)
  }, [isInView, value])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-white/10 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white/10 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 h-72 bg-white/10 rounded-2xl" />
        <div className="lg:col-span-3 h-72 bg-white/10 rounded-2xl" />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-gray-100">
      <p className="text-xs font-bold text-gray-500 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 font-medium">{p.name}:</span>
          <span className="font-bold text-gray-900">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)

  useEffect(() => { fetchDashboard().then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return <LoadingSkeleton />
  if (!data) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-30 animate-pulse">📊</div>
        <p className="text-gray-400 text-lg font-medium">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="btn-premium mt-4">Retry</button>
      </div>
    </div>
  )

  const utilization = data.activeWarehouses > 0 ? Math.round((data.activeWarehouses / (data.activeWarehouses + 1)) * 100) : 0

  const revenueData: { month: string; revenue: number; lastYear: number }[] = []

  const totalStock = data.stockByCategory.reduce((s, c) => s + c.total, 0)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div
        ref={heroRef}
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl hero-gradient text-white p-6 sm:p-8 shadow-2xl shadow-purple-500/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.3),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-[60px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">Live Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Admin
            </h1>
            <p className="text-blue-200/70 text-sm mt-1">Real-time overview of your entire inventory.</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Items', value: data.totalItems, gradient: 'from-blue-400 to-cyan-500', icon: '📦' },
              { label: 'Value', value: `$${data.totalValue.toLocaleString()}`, gradient: 'from-emerald-400 to-teal-500', icon: '💰' },
              { label: 'Warehouses', value: data.activeWarehouses, gradient: 'from-purple-400 to-pink-500', icon: '🏭' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-xl px-4 py-2.5 text-center min-w-[80px] shadow-lg shadow-${s.gradient.split(' ')[0].replace('from-', '')}/30`}>
                <p className="text-[18px] font-extrabold leading-tight">{s.value}</p>
                <p className="text-[9px] text-white/70 uppercase tracking-wider font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: data.totalItems, gauge: Math.round((data.totalItems / (data.totalItems + 10)) * 100), color: '#0071e3', icon: '📦', bg: 'from-blue-50 to-cyan-50' },
          { label: 'Portfolio', value: `$${data.totalValue.toLocaleString()}`, gauge: 78, color: '#10b981', icon: '💰', bg: 'from-emerald-50 to-teal-50' },
          { label: 'Low Stock', value: data.lowStock, gauge: 100 - Math.min(data.lowStock * 20, 100), color: '#f59e0b', icon: '⚠️', alert: data.lowStock > 0, bg: 'from-amber-50 to-orange-50' },
          { label: 'Out of Stock', value: data.outStock, gauge: 100 - Math.min(data.outStock * 25, 100), color: '#ec4899', icon: '🚫', alert: data.outStock > 0, bg: 'from-pink-50 to-rose-50' },
        ].map(s => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3, scale: 1.01 }}
            className="premium-card p-5 relative overflow-hidden"
          >
            {s.alert && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold">{s.label}</p>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-lg shadow-sm`}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">
              {typeof s.value === 'number' ? <AnimatedCounter value={s.value} /> : s.value}
            </p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.gauge}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16,1,0.3,1] }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)` }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 premium-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-gray-800 self-start mb-2">Stock Distribution</h3>
          <p className="text-[10px] text-gray-400 self-start mb-4 font-medium uppercase tracking-wider">By category</p>
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={data.stockByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {data.stockByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-gray-900">{totalStock}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider -mt-0.5">Total</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
            {data.stockByCategory.map((c, i) => (
              <div key={c.category} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] text-gray-500 font-medium">{c.category}</span>
                <span className="text-[11px] text-gray-900 font-bold">{c.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {[
            { label: 'Suppliers Active', value: data.activeSuppliers, sub: 'vendors', color: '#06b6d4', icon: '🚚', bg: 'from-cyan-50 to-blue-50' },
            { label: 'Pending POs', value: data.pendingPOs, sub: 'awaiting', color: '#f59e0b', icon: '📋', alert: data.pendingPOs > 0, bg: 'from-amber-50 to-orange-50' },
            { label: 'Invoices Paid', value: data.paidInvoices, sub: 'completed', color: '#10b981', icon: '🧾', bg: 'from-emerald-50 to-teal-50' },
            { label: 'Utilization', value: `${utilization}%`, sub: 'warehouse capacity', color: '#8b5cf6', icon: '🏭', gauge: utilization, bg: 'from-purple-50 to-violet-50' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -2 }}
              className="premium-card p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold">{s.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-lg shadow-sm`}>
                  {s.icon}
                </div>
              </div>
              {'gauge' in s && typeof s.gauge === 'number' && (
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.gauge}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: [0.16,1,0.3,1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {revenueData.length > 0 && (
        <motion.div variants={fadeUp} className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Revenue Trends</h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">Current year vs last year</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                <span className="text-[10px] text-gray-500 font-semibold">This Year</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]/50" />
                <span className="text-[10px] text-gray-500 font-semibold">Last Year</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.1)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis axisLine={false} tickLine={false} stroke="rgba(0,0,0,0.1)" tick={{ fontSize: 12, fill: '#86868b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={3} fill="url(#revG)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#0071e3', stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="lastYear" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={{ r: 0 }} activeDot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm">⚠️</div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Low Stock Alerts</h3>
              <p className="text-[10px] text-gray-400 font-medium">{data.lowStockItems.length} items need attention</p>
            </div>
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <span className="text-4xl mb-3">✅</span>
              <p className="text-gray-400 text-sm font-medium">All stock levels healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockItems.map((item, i) => (
                <motion.div
                  key={item.sku}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl px-5 py-3.5 border border-amber-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-sm">📦</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-amber-600">{item.quantity}</p>
                    <p className="text-[10px] text-gray-400 font-medium">min {item.minStock}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-sm">📜</div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
                <p className="text-[10px] text-gray-400 font-medium">Latest events across your inventory</p>
              </div>
            </div>
            <Link to="/activity" className="text-xs text-purple-600 hover:text-purple-700 hover:underline font-semibold">View all</Link>
          </div>
          {data.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-gray-400 text-sm font-medium">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {data.recentActivity.slice(0, 6).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-purple-50/50 transition-colors"
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    a.action.includes('Received') ? 'bg-emerald-100' :
                    a.action.includes('Paid') ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {a.action.includes('Received') ? '📥' : a.action.includes('Paid') ? '💰' : '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 font-semibold truncate">{a.details}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.userName} · {new Date(a.createdAt).toLocaleString()}</p>
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
