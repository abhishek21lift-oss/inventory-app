import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', color: 'from-blue-400 to-cyan-400' },
  { path: '/items', label: 'Items', icon: '📦', color: 'from-purple-400 to-pink-400' },
  { path: '/warehouses', label: 'Warehouses', icon: '🏭', color: 'from-emerald-400 to-teal-400' },
  { path: '/suppliers', label: 'Suppliers', icon: '🚚', color: 'from-orange-400 to-rose-400' },
  { path: '/purchase-orders', label: 'POs', icon: '📋', color: 'from-indigo-400 to-violet-400' },
  { path: '/invoices', label: 'Invoices', icon: '🧾', color: 'from-green-400 to-emerald-400' },
  { path: '/activity', label: 'Activity', icon: '📜', color: 'from-pink-400 to-rose-400' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 25%, #24243e 50%, #1a1a3e 75%, #0f0c29 100%)' }}>
      <header className="sticky top-0 z-50">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/30"
              >
                💪
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Inventory</span>
                </h1>
                <p className="text-[8px] text-gray-400 tracking-[0.12em] uppercase font-semibold -mt-0.5">Management Suite</p>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1 px-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="navActive"
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <span className="text-[15px]">{item.icon}</span>
                        <span className="relative z-10">{item.label}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </motion.div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-gray-600 leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[9px] text-gray-400 capitalize font-medium leading-tight">{user?.role}</p>
                </div>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10 ml-1"
                  title="Logout"
                >
                  ⏻
                </motion.button>
              </div>

              <motion.button
                onClick={() => setMobileOpen(prev => !prev)}
                whileTap={{ scale: 0.9 }}
                className="md:hidden relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="relative w-4 h-3.5">
                  <span className={`absolute left-0 top-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                  <span className={`absolute left-0 top-1/2 -translate-y-[1px] w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16,1,0.3,1] as const }}
              className="md:hidden border-t border-white/10 bg-white/95 backdrop-blur-xl shadow-lg overflow-hidden"
            >
              <nav className="px-3 py-2 space-y-0.5">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border-l-2 border-purple-500'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </motion.div>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2 pb-1 px-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 text-lg"
                      title="Logout"
                    >
                      ⏻
                    </motion.button>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16,1,0.3,1] as const }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
