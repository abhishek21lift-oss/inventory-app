import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { fetchDashboard } from '../api'
import { useAuth } from '../context/AuthContext'
import type { DashboardData } from '../types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Package, DollarSign, AlertTriangle, XCircle, ShoppingCart,
  Receipt, Warehouse, Truck, TrendingUp, Clock
} from 'lucide-react'
import { fmtCurrency, fmtDateTime } from '../lib/utils'

const PIE_COLORS = ['#c9973a', '#7c1b1b', '#059669', '#2563eb', '#7c3aed', '#d97706', '#0e7490']

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } }

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || value === 0) { setCount(value); return }
    let cur = 0
    const step = Math.max(1, Math.ceil(value / 40))
    const id = setInterval(() => {
      cur = Math.min(cur + step, value)
      setCount(cur)
      if (cur >= value) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [inView, value])
  return <span ref={ref}>{count.toLocaleString()}</span>
}

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton" style={{ height: 100, borderRadius: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }}>
        <div className="skeleton" style={{ height: 280 }} />
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-surface-3)',
      border: '1px solid var(--color-border-med)',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard().then(setData).finally(() => setLoading(false)) }, [])

  if (loading) return <Skeleton />
  if (!data) return (
    <div className="empty-state">
      <div className="empty-icon"><Package size={22} style={{ color: 'var(--color-text-muted)' }} /></div>
      <p>Failed to load dashboard</p>
      <span>Check your connection and try again</span>
      <button onClick={() => window.location.reload()} className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
        Retry
      </button>
    </div>
  )

  const totalStock = data.stockByCategory.reduce((s, c) => s + c.total, 0)
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero banner */}
      <motion.div variants={item} className="hero-banner" style={{ padding: '24px 28px' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text-primary)' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0', fontWeight: 400 }}>
              Real-time overview of your inventory
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Items', value: data.totalItems, color: 'rgba(201,151,58,0.15)', border: 'rgba(201,151,58,0.25)', text: 'var(--color-brand-gold-light)' },
              { label: 'Value', value: fmtCurrency(data.totalValue), color: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.25)', text: '#10b981' },
              { label: 'Warehouses', value: data.activeWarehouses, color: 'rgba(124,27,27,0.15)', border: 'rgba(160,32,32,0.25)', text: '#f87171' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.color,
                border: `1px solid ${s.border}`,
                borderRadius: 12, padding: '10px 16px',
                textAlign: 'center', minWidth: 72
              }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: s.text, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Items', value: data.totalItems, icon: Package, color: '#c9973a', variant: 'stat-card-gold', prefix: '' },
          { label: 'Portfolio Value', value: data.totalValue, icon: DollarSign, color: '#10b981', variant: 'stat-card-emerald', isCurrency: true },
          { label: 'Low Stock', value: data.lowStock, icon: AlertTriangle, color: '#d97706', variant: data.lowStock > 0 ? 'stat-card-maroon' : '', alert: data.lowStock > 0 },
          { label: 'Out of Stock', value: data.outStock, icon: XCircle, color: '#f87171', variant: data.outStock > 0 ? 'stat-card-maroon' : '', alert: data.outStock > 0 },
          { label: 'Pending POs', value: data.pendingPOs, icon: ShoppingCart, color: '#818cf8', variant: '' },
          { label: 'Paid Invoices', value: data.paidInvoices, icon: Receipt, color: '#10b981', variant: '' },
          { label: 'Warehouses', value: data.activeWarehouses, icon: Warehouse, color: '#60a5fa', variant: '' },
          { label: 'Suppliers', value: data.activeSuppliers, icon: Truck, color: '#c9973a', variant: '' },
        ].map(s => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              whileHover={{ y: -2 }}
              className={`stat-card ${s.variant}`}
            >
              {s.alert && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ef4444',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {s.label}
                </span>
                <div className="stat-icon" style={{ background: `${s.color}18` }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.isCurrency
                  ? fmtCurrency(s.value as number)
                  : <Counter value={s.value as number} />
                }
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>

        {/* Pie chart */}
        <div className="card" style={{ padding: '20px 20px 16px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Stock by Category</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{totalStock} units total</div>
          </div>
          {data.stockByCategory.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <p style={{ fontSize: 12 }}>No data yet</p>
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={data.stockByCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={82}
                      paddingAngle={3}
                    >
                      {data.stockByCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>{totalStock}</div>
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {data.stockByCategory.map((c, i) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{c.category}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Low stock + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Low Stock */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(217,119,6,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Low Stock Alerts</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{data.lowStockItems.length} items</div>
                </div>
              </div>
              <Link to="/items" style={{ fontSize: 11, color: 'var(--color-brand-gold-light)', fontWeight: 600, textDecoration: 'none' }}>
                View all
              </Link>
            </div>
            {data.lowStockItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                All stock levels healthy ✓
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.lowStockItems.slice(0, 4).map(itm => (
                  <div key={itm.sku} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(217,119,6,0.06)',
                    border: '1px solid rgba(217,119,6,0.15)',
                    borderRadius: 10
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itm.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{itm.sku}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em' }}>{itm.quantity}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>min {itm.minStock}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(201,151,58,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Clock size={14} style={{ color: 'var(--color-brand-gold-light)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Activity</div>
              </div>
              <Link to="/activity" style={{ fontSize: 11, color: 'var(--color-brand-gold-light)', fontWeight: 600, textDecoration: 'none' }}>
                View all
              </Link>
            </div>
            {data.recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No activity yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.recentActivity.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1
                    }}>
                      <TrendingUp size={11} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.details}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                        {a.userName} · {fmtDateTime(a.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
