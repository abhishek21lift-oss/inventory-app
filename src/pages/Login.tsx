import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
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
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="login-card"
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
            style={{ display: 'inline-block', marginBottom: 16 }}
          >
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #5a1010, #7c1b1b)',
              border: '1px solid rgba(201,151,58,0.3)',
              boxShadow: '0 8px 32px rgba(124,27,27,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              overflow: 'hidden'
            }}>
              <img src="/logo.png" alt="619" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </motion.div>

          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
            <span className="text-gradient-gold">619</span>{' '}
            <span style={{ color: 'var(--color-text-primary)' }}>NUTRITION</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 500 }}>
            {isRegister ? 'Create an account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: '#f87171',
              marginBottom: 16
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="form-group"
              style={{ margin: 0 }}
            >
              <label className="input-label">Name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </motion.div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 11, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', padding: 2,
                  display: 'flex', alignItems: 'center'
                }}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : isRegister ? 'Create Account' : 'Sign In'}
          </motion.button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 20 }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(p => !p); setError('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-brand-gold-light)', fontWeight: 600, fontSize: 12,
              padding: 0
            }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
