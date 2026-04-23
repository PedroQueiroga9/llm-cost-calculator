'use client'
import { motion } from 'framer-motion'
import { Calculator, Zap, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="glass border-b border-white/[0.06] h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display text-white text-lg leading-none">LLM</span>
              <span className="font-body text-brand-400 text-lg leading-none ml-1">Cost</span>
            </div>
            <span className="hidden sm:block text-xs text-slate-500 border border-white/10 rounded px-1.5 py-0.5 font-mono">
              v1.0
            </span>
          </div>

          {/* Center badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-950/60 border border-brand-700/40">
            <Zap className="w-3 h-3 text-brand-400" />
            <span className="text-xs text-brand-300 font-body">
              20 modelos · Preços abril 2026
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-xs text-slate-400 hidden sm:block">Online</span>
            </div>

            {user && (
              <>
                <div className="w-px h-4 bg-white/10" />
                {/* Email do usuário */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-body">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[160px]">{user.email}</span>
                </div>
                {/* Logout */}
                <button
                  onClick={signOut}
                  title="Sair"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors font-body"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
