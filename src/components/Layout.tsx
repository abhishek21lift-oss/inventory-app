import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavGroup { label: string; items: { path: string; label: string; icon: string }[] }

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/items', label: 'Items', icon: '📦' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/warehouses', label: 'Warehouses', icon: '🏭' },
      { path: '/suppliers', label: 'Suppliers', icon: '🚚' },
      { path: '/purchase-orders', label: 'Purchase Orders', icon: '📋' },
      { path: '/invoices', label: 'Invoices', icon: '🧾' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/activity', label: 'Activity Log', icon: '📜' },
    ],
  },
]

function SidebarNav({ onNav }: { onNav: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            💪
          </div>
          <div>
            <h1 className="text-[15px] font-extrabold text-gray-900 tracking-tight leading-tight">Inventory</h1>
            <p className="text-[9px] text-gray-400 tracking-[0.12em] uppercase font-semibold mt-0.5">Management Suite</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold px-3 pb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onNav}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-blue-700 bg-blue-50/80'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-500" />}
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

      </div>

      {/* User card */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-default">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 text-base" title="Logout">
            ⏻
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f5f7' }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100/80 flex flex-col transition-all duration-300 ease-out shadow-sm ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <SidebarNav onNav={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-gray-100/50" style={{ background: 'rgba(245,245,247,0.82)' }}>
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="lg:hidden relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <div className="relative w-4 h-3.5">
                <span className={`absolute left-0 top-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${sidebarOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1/2 -translate-y-[1px] w-full h-[2px] bg-current rounded-full transition-all duration-200 ${sidebarOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${sidebarOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
              </div>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-100/50 shadow-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
