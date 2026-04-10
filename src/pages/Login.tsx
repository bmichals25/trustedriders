import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    // Simulate auth delay — replace with real auth
    await new Promise((res) => setTimeout(res, 900))
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#0077B6] flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">TrustedRiders</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-lg font-semibold text-slate-800 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">Access your dispatch dashboard</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dispatch@trustedriders.com"
                aria-required="true"
                className="w-full h-10 px-3 text-sm text-slate-800 bg-white border border-slate-200
                           rounded-md outline-none placeholder:text-slate-400
                           focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-required="true"
                  className="w-full h-10 px-3 pr-10 text-sm text-slate-800 bg-white border border-slate-200
                             rounded-md outline-none placeholder:text-slate-400
                             focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#0077B6] hover:bg-[#005F8E] text-white text-sm font-medium
                         rounded-md flex items-center justify-center gap-2 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed
                         focus-visible:ring-2 focus-visible:ring-[#0077B6] focus-visible:ring-offset-2 outline-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          TrustedRiders Dispatch — Operations Platform
        </p>
      </motion.div>
    </div>
  )
}
