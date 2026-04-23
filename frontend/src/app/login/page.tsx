'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calculator, Lock, Mail, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Credenciais inválidas. Verifique seu email e senha.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-brand-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-brand-950/30 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-white text-xl leading-none">LLM</span>
            <span className="font-body text-brand-400 text-xl leading-none ml-1">Cost</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          <h1 className="font-display text-xl text-white mb-1">Acesso restrito</h1>
          <p className="text-xs text-slate-500 font-body mb-6">
            Faça login com sua conta corporativa
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-body mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white font-body placeholder-slate-600 focus:outline-none focus:border-brand-600/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-body mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white font-body placeholder-slate-600 focus:outline-none focus:border-brand-600/60 transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-red-400 font-body bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-700/60 hover:bg-brand-600/60 border border-brand-600/40 text-sm font-body text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6 font-body">
          Acesso exclusivo para colaboradores autorizados
        </p>
      </motion.div>
    </main>
  )
}
