'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { type ModelPricing } from '@/lib/api'
import { ProviderBadge, TierBadge } from '@/components/ui'
import { fmtContextWindow, PROVIDER_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  models: ModelPricing[]
  value: string
  onChange: (modelId: string) => void
  label?: string
}

export function ModelSelector({ models, value, onChange, label = 'Modelo' }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = models.find((m) => m.id === value)

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()),
  )

  // Group by provider
  const grouped = filtered.reduce<Record<string, ModelPricing[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = []
    acc[m.provider].push(m)
    return acc
  }, {})

  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-400 font-body mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-white/[0.05] border border-white/[0.08] hover:border-brand-700/60 rounded-xl px-3 py-2.5 text-sm text-white font-body transition-colors"
        >
          {selected ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: PROVIDER_COLORS[selected.provider_id] || '#6b7280' }}
              />
              <span className="truncate">{selected.name}</span>
              <TierBadge tier={selected.tier} />
            </div>
          ) : (
            <span className="text-slate-500">Selecione um modelo...</span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 text-slate-500 ml-2 flex-shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 right-0 z-50 bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar modelo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1 font-body"
                    autoFocus
                  />
                </div>
              </div>

              {/* Model list */}
              <div className="max-h-72 overflow-y-auto">
                {Object.entries(grouped).map(([provider, provModels]) => (
                  <div key={provider}>
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-slate-600 font-body border-b border-white/[0.04]">
                      {provider}
                    </div>
                    {provModels.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { onChange(m.id); setOpen(false); setSearch('') }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left',
                          m.id === value && 'bg-brand-950/50',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: PROVIDER_COLORS[m.provider_id] || '#6b7280' }}
                          />
                          <span className="text-sm text-white truncate font-body">{m.name}</span>
                          <TierBadge tier={m.tier} />
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-slate-500">
                            ${m.input_per_m}/${m.output_per_m}
                          </span>
                          <span className="text-[10px] text-slate-600 hidden sm:block">
                            {fmtContextWindow(m.context_window)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-600 font-body">
                    Nenhum modelo encontrado
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected model info strip */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 flex flex-wrap items-center gap-2"
        >
          <ProviderBadge providerId={selected.provider_id} name={selected.provider} />
          <span className="text-[10px] font-mono text-slate-600">
            ctx: {fmtContextWindow(selected.context_window)}
          </span>
          {selected.batch_available && (
            <span className="text-[10px] text-emerald-500 font-body">✓ Batch API</span>
          )}
          {selected.cached_input_per_m && (
            <span className="text-[10px] text-brand-400 font-body">✓ Cache</span>
          )}
        </motion.div>
      )}
    </div>
  )
}
