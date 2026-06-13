import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) { await register(email, password, name) }
      else { await login(email, password) }
      navigate('/')
    } catch (err: any) { setError(err.message || 'Authentication failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden hero-gradient">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16,1,0.3,1] as const }}
        className="relative w-full max-w-sm"
      >
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/25">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-9">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-purple-500/25 mb-4"
              >
                💪
              </motion.div>
              <h1 className="text-xl font-extrabold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Inventory System</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                {isRegister ? 'Create your account' : 'Sign in to your account'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5 font-semibold"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-[0.15em]">Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="input-apple" placeholder="Your name" />
                </motion.div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-[0.15em]">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-apple" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-[0.15em]">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-apple" placeholder="••••••" />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-premium w-full justify-center py-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing...
                  </span>
                ) : isRegister ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6 font-medium">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-purple-600 hover:text-purple-700 hover:underline font-bold"
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
