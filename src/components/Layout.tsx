import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, Warehouse, Truck, ClipboardList,
  Receipt, Activity, LogOut, Menu
} from 'lucide-react'
import { getInitials } from '../lib/utils'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    label: 'Inventory',
    items: [
      { path: '/items', label: 'Items', icon: Package, end: false },
      { path: '/warehouses', label: 'Warehouses', icon: Warehouse, end: false },
      { path: '/suppliers', label: 'Suppliers', icon: Truck, end: false },
    ]
  },
  {
    label: 'Transactions',
    items: [
      { path: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, end: false },
      { path: '/invoices', label: 'Invoices', icon: Receipt, end: false },
    ]
  },
  {
    label: 'Logs',
    items: [
      { path: '/activity', label: 'Activity', icon: Activity, end: false },
    ]
  }
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    onNav?.()
  }

  return (
    <>
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo" onClick={onNav}>
          <img src="/logo.png" alt="619 Nutrition" className="sidebar-logo-img" />
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">
              <span>619</span>
              <span> NUTRITION</span>
            </div>
            <div className="sidebar-brand-sub">Inventory</div>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="nav-section-label">{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNav}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-item-icon">
                    <Icon size={14} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout} title="Sign out">
          <div className="user-avatar">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <LogOut size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay visible"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="sidebar flex flex-col md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="app-main">
        {/* Top bar (mobile only for hamburger, desktop for breadcrumb/actions) */}
        <header className="top-bar">
          <button
            className="md:hidden btn btn-ghost btn-icon mr-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Could add global search / notifications here */}
          <div className="hidden md:flex items-center gap-2">
            <div
              style={{
                width: 28, height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--color-brand-maroon), var(--color-brand-maroon-light))',
                border: '1px solid rgba(201,151,58,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--color-brand-gold-light)',
                cursor: 'default'
              }}
            >
              {getInitials(user?.name || 'U')}
            </div>
          </div>
        </header>

        <main className="page-content">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : ''}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

