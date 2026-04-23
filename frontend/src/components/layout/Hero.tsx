'use client'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[42vh] flex items-end pb-8 overflow-hidden pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(109,47,235,0.25) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow orb */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-brand-600/10 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-body text-brand-300 uppercase tracking-widest">
              Calculadora profissional de custos de IA
            </span>
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-4">
            Calcule o custo
            <br />
            <span className="text-gradient">real das suas LLMs</span>
          </h1>

          <p className="font-body text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            Compare preços de 20 modelos em tempo real. Claude, GPT, Gemini, Groq e mais —
            por requisição, mensal, e por sistema de agentes.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-6 text-slate-500"
          >
            <ArrowDown className="w-4 h-4 animate-bounce" />
            <span className="text-sm">Selecione uma aba abaixo para começar</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
