'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, BarChart2, Bot, Clock } from 'lucide-react'
import { useModels } from '@/hooks/useModels'
import { SingleCalcTab } from './SingleCalcTab'
import { MonthlyCalcTab } from './MonthlyCalcTab'
import { CompareTab } from './CompareTab'
import { AgentTab } from './AgentTab'
import { HistoryTab } from './HistoryTab'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'single', label: 'Por requisição', icon: Zap },
  { id: 'monthly', label: 'Custo mensal', icon: TrendingUp },
  { id: 'compare', label: 'Comparativo', icon: BarChart2 },
  { id: 'agents', label: 'Por agente', icon: Bot },
  { id: 'history', label: 'Histórico', icon: Clock },
]

export function Calculator() {
  const [activeTab, setActiveTab] = useState('single')
  const { models, loading, error } = useModels()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-body text-sm">Carregando modelos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-red-400 font-body mb-2">Erro ao conectar ao backend</p>
        <p className="text-slate-500 text-sm font-body">{error}</p>
        <p className="text-slate-600 text-xs mt-3 font-mono">
          Certifique-se de que o servidor FastAPI está rodando em localhost:8000
        </p>
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body whitespace-nowrap transition-all duration-200 flex-shrink-0',
                active
                  ? 'bg-brand-700/50 text-white border border-brand-600/40'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-brand-300' : 'text-slate-600')} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'single' && <SingleCalcTab models={models} />}
          {activeTab === 'monthly' && <MonthlyCalcTab models={models} />}
          {activeTab === 'compare' && <CompareTab models={models} />}
          {activeTab === 'agents' && <AgentTab models={models} />}
          {activeTab === 'history' && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
